import { google } from 'googleapis'
import { Readable } from 'stream'

// ─────────────────────────────────────────────
// OAuth2 client factory
// ─────────────────────────────────────────────

function getOAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
  )

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
  })

  return oauth2Client
}

// ─────────────────────────────────────────────
// Upload file to Google Drive
// ─────────────────────────────────────────────

/**
 * Uploads a file buffer to Google Drive and returns the public URL.
 *
 * @param fileBuffer - The file contents as a Buffer
 * @param fileName - The name to give the file in Drive
 * @param mimeType - The MIME type of the file (e.g. 'image/jpeg')
 * @returns The public-facing Google Drive URL for the file
 */
export async function uploadFileToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const auth = getOAuthClient()
  const drive = google.drive({ version: 'v3', auth })

  // Convert buffer to readable stream
  const stream = Readable.from(fileBuffer)

  // Upload the file
  const uploadResponse = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType,
      parents: process.env.GOOGLE_DRIVE_FOLDER_ID
        ? [process.env.GOOGLE_DRIVE_FOLDER_ID]
        : undefined,
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, name, webViewLink, webContentLink',
  })

  const fileId = uploadResponse.data.id

  if (!fileId) {
    throw new Error('Google Drive upload failed: no file ID returned')
  }

  // Make the file publicly readable
  await drive.permissions.create({
    fileId,
    requestBody: {
      type: 'anyone',
      role: 'reader',
    },
  })

  return getDriveImageUrl(fileId)
}

// ─────────────────────────────────────────────
// Get public image URL from file ID
// ─────────────────────────────────────────────

/**
 * Returns a public direct-view URL for a Google Drive file.
 * This URL can be used directly in <img> tags and Next.js Image components.
 *
 * @param fileId - The Google Drive file ID
 * @returns Public URL string
 */
export function getDriveImageUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`
}

/**
 * Extracts the file ID from a Google Drive URL.
 * Supports various Drive URL formats.
 *
 * @param url - A Google Drive URL
 * @returns The file ID, or null if not found
 */
export function extractDriveFileId(url: string): string | null {
  // Handle: https://drive.google.com/uc?export=view&id=FILE_ID
  const ucMatch = url.match(/[?&]id=([^&]+)/)
  if (ucMatch) return ucMatch[1]

  // Handle: https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([^/]+)/)
  if (fileMatch) return fileMatch[1]

  // Handle: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/open\?id=([^&]+)/)
  if (openMatch) return openMatch[1]

  return null
}

// ─────────────────────────────────────────────
// Delete file from Google Drive
// ─────────────────────────────────────────────

/**
 * Permanently deletes a file from Google Drive.
 *
 * @param fileId - The Google Drive file ID to delete
 */
export async function deleteFileFromDrive(fileId: string): Promise<void> {
  const auth = getOAuthClient()
  const drive = google.drive({ version: 'v3', auth })

  await drive.files.delete({ fileId })
}

// ─────────────────────────────────────────────
// List files in a folder
// ─────────────────────────────────────────────

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  url: string
  thumbnailUrl?: string
  createdTime?: string
}

/**
 * Lists files in the configured Google Drive folder.
 *
 * @param folderId - Override the default folder ID (optional)
 * @param maxResults - Maximum number of files to return (default: 50)
 * @returns Array of file metadata
 */
export async function listFolderFiles(
  folderId?: string,
  maxResults = 50
): Promise<DriveFile[]> {
  const auth = getOAuthClient()
  const drive = google.drive({ version: 'v3', auth })

  const targetFolderId = folderId ?? process.env.GOOGLE_DRIVE_FOLDER_ID

  if (!targetFolderId) {
    throw new Error('No Google Drive folder ID configured')
  }

  const response = await drive.files.list({
    q: `'${targetFolderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, thumbnailLink, createdTime)',
    pageSize: maxResults,
    orderBy: 'createdTime desc',
  })

  const files = response.data.files ?? []

  return files.map((file) => ({
    id: file.id!,
    name: file.name!,
    mimeType: file.mimeType!,
    url: getDriveImageUrl(file.id!),
    thumbnailUrl: file.thumbnailLink ?? undefined,
    createdTime: file.createdTime ?? undefined,
  }))
}
