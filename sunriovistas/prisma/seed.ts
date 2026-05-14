import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─────────────────────────────────────────────
  // Admin User
  // ─────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sunriovistas.com' },
    update: {},
    create: {
      email: 'admin@sunriovistas.com',
      name: 'SunRioVistas Admin',
      role: UserRole.ADMIN,
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // ─────────────────────────────────────────────
  // RVs
  // ─────────────────────────────────────────────

  const lunaris = await prisma.rV.upsert({
    where: { slug: 'lunaris' },
    update: {},
    create: {
      name: 'Lunaris',
      slug: 'lunaris',
      emoji: '🌙',
      tagline: 'Cozy Couples & Family-Friendly Getaways',
      theme: 'cozy, warm, family-friendly',
      description:
        'A warm and inviting retreat perfect for families and couples who want to enjoy the outdoors without roughing it. Lunaris offers all the comforts of home wrapped in a cozy, nature-inspired aesthetic.',
      longDescription:
        'Step into Lunaris and feel instantly at home. This beautifully appointed RV is designed with families and couples in mind — featuring warm wood accents, plush furnishings, and everything you need for a memorable stay near Folsom Lake. Whether you\'re roasting marshmallows by the fire pit, waking up to birdsong, or cozying up inside with a good book, Lunaris delivers the perfect blend of comfort and nature.',
      bestFor: ['couples', 'small families', 'beginner campers'],
      vibe: ['campfires', 'family memories', 'cozy interiors', 'lakeside mornings'],
      maxGuests: 6,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [
        'Queen Bed',
        'Sleeper Sofa',
        'Full Kitchen',
        'AC/Heat',
        'TV',
        'WiFi',
        'Outdoor Furniture',
        'BBQ Grill',
        'Fire Pit',
        'Outdoor Shower',
      ],
      images: [],
      colorScheme: 'amber',
      isActive: true,
      sortOrder: 1,
    },
  })

  const stellaris = await prisma.rV.upsert({
    where: { slug: 'stellaris' },
    update: {},
    create: {
      name: 'Stellaris',
      slug: 'stellaris',
      emoji: '✨',
      tagline: 'Spiritual & Soulful Journeys',
      theme: 'wellness, healing, yoga, meditation',
      description:
        'A serene sanctuary designed for those seeking restoration, mindfulness, and a deeper connection with nature. Stellaris invites you to slow down, breathe deeply, and rediscover yourself.',
      longDescription:
        'Stellaris is more than an RV — it\'s a wellness retreat on wheels. Designed for the soul-seeking traveler, this thoughtfully curated space features a dedicated meditation corner, aromatherapy diffuser, and yoga mat to support your practice. Disconnect from the noise of everyday life and reconnect with what matters most. Whether you\'re journaling at sunrise, practicing yoga under the open sky, or simply resting in the hammock as the breeze moves through the trees, Stellaris creates the conditions for genuine healing.',
      bestFor: ['wellness travelers', 'couples retreats', 'solo travelers'],
      vibe: ['digital detox', 'nature healing', 'mindfulness', 'slow mornings'],
      maxGuests: 4,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [
        'King Bed',
        'Yoga Mat & Blocks',
        'Meditation Corner',
        'Full Kitchen',
        'AC/Heat',
        'Aromatherapy Diffuser',
        'Himalayan Salt Lamp',
        'Journal & Pen Set',
        'Outdoor Hammock',
        'Privacy Curtains',
      ],
      images: [],
      colorScheme: 'purple',
      isActive: true,
      sortOrder: 2,
    },
  })

  const solaris = await prisma.rV.upsert({
    where: { slug: 'solaris' },
    update: {},
    create: {
      name: 'Solaris',
      slug: 'solaris',
      emoji: '☀️',
      tagline: 'For Free Spirits & Young Explorers',
      theme: 'adventure, exploration, wine-country',
      description:
        'Bold, vibrant, and ready for adventure. Solaris is built for explorers who want to see more, do more, and live more — with all the comfort of a stylish home base.',
      longDescription:
        'Solaris is the ultimate adventure base camp. Designed for free spirits and young explorers, this RV is stocked for fun — from the game console and Bluetooth speaker inside to the hammock and cornhole set outside. Whether you\'re spending the day exploring wine country, kayaking at Folsom Lake, or simply hanging out with friends under the string lights, Solaris sets the scene for unforgettable memories. The wine cooler and outdoor bar cart make it perfect for elevated social evenings under the California stars.',
      bestFor: ['young couples', 'friends', 'adventurous travelers'],
      vibe: ['wine-country sunsets', 'exploration', 'scenic escapes', 'social weekends'],
      maxGuests: 6,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [
        'Two Queen Beds',
        'Game Console',
        'Bluetooth Speaker',
        'Full Kitchen',
        'AC/Heat',
        'String Lights',
        'Hammock',
        'Cornhole Set',
        'Wine Cooler',
        'Outdoor Bar Cart',
      ],
      images: [],
      colorScheme: 'orange',
      isActive: true,
      sortOrder: 3,
    },
  })

  console.log('✅ RVs created:', lunaris.name, stellaris.name, solaris.name)

  // ─────────────────────────────────────────────
  // Destinations
  // ─────────────────────────────────────────────

  const bealsPoint = await prisma.destination.upsert({
    where: { slug: 'beals-point' },
    update: {},
    create: {
      name: 'Beals Point / Folsom Lake',
      slug: 'beals-point',
      emoji: '🏖️',
      description:
        'The crown jewel of Northern California camping, Beals Point offers direct access to the stunning Folsom Lake shoreline with endless outdoor recreation.',
      longDescription:
        'Beals Point at Folsom Lake State Recreation Area is one of Northern California\'s most beloved outdoor destinations. Situated on the western shore of Folsom Lake, this campground offers direct lake access, beautiful sunsets, and a wealth of recreational activities. Whether you\'re paddling across glassy morning waters, biking the Folsom Lake Bike Trail, or simply relaxing on the beach with family, Beals Point delivers an authentic California outdoor experience. The campground features hookup sites, making it ideal for a fully comfortable glamping stay with SunRioVistas.',
      location: 'Folsom, CA — 25 miles east of Sacramento',
      campgroundFeeEstimate: '$30–$60/night',
      campgroundFeeNote: 'Fees vary by site type and season. Book directly at ReserveCA.com.',
      campgroundFeeDisclaimer:
        'Campground fees are paid directly to the campground and are not included in your SunRioVistas booking total.',
      hookupAvailable: true,
      activities: [
        'kayaking',
        'paddleboarding',
        'biking',
        'fishing',
        'hiking',
        'swimming',
        'campfire nights',
      ],
      highlights: [
        'Direct lake access',
        'Stunning lake sunsets',
        'Family-friendly atmosphere',
        'Boat rentals nearby',
      ],
      images: [],
      isActive: true,
      sortOrder: 1,
    },
  })

  const placerville = await prisma.destination.upsert({
    where: { slug: 'placerville-rv-resort' },
    update: {},
    create: {
      name: 'Placerville RV Resort',
      slug: 'placerville-rv-resort',
      emoji: '🍷',
      description:
        'Nestled in the heart of Gold Country wine country, Placerville RV Resort puts you steps away from world-class wineries, apple orchards, and historic downtown.',
      longDescription:
        'Experience the charm of El Dorado County\'s wine country from the comfort of your SunRioVistas RV. Placerville RV Resort offers full hookups in a beautifully landscaped setting, just minutes from dozens of acclaimed wineries, apple picking farms, and the historic main street of Old Hangtown. This destination is perfect for couples seeking a romantic escape, foodies eager to explore farm-to-table dining, and adventurers ready to tackle the mountain biking trails of the Sierra foothills.',
      location: 'Placerville, CA — El Dorado County Wine Country',
      campgroundFeeEstimate: '~$90/night',
      campgroundFeeNote: 'Full hookup resort. Rates may vary by season. Book directly with the resort.',
      campgroundFeeDisclaimer:
        'Campground fees are paid directly to the campground and are not included in your SunRioVistas booking total.',
      hookupAvailable: true,
      activities: [
        'wine tasting',
        'apple picking',
        'historic downtown',
        'mountain biking',
        'hiking',
      ],
      highlights: [
        'Gold Country wine country',
        'Full hookups available',
        'Minutes from downtown Placerville',
        'Nearby apple orchards',
      ],
      images: [],
      isActive: true,
      sortOrder: 2,
    },
  })

  const redHawk = await prisma.destination.upsert({
    where: { slug: 'red-hawk-casino' },
    update: {},
    create: {
      name: 'Red Hawk Casino',
      slug: 'red-hawk-casino',
      emoji: '🎰',
      description:
        'Park steps away from one of Northern California\'s premier entertainment destinations, offering world-class gaming, dining, and live shows — all with complimentary dry camping.',
      longDescription:
        'Red Hawk Casino in Placerville offers a unique glamping experience for those who want easy access to premier entertainment. Dry camping is available free of charge for RV guests, making this an exceptional value destination. Spend your evenings enjoying casino entertainment, fine dining at award-winning restaurants, or catching a live show. By day, explore the surrounding Gold Country, visit nearby wineries, or simply relax in your SunRioVistas RV. This destination is ideal for groups looking to mix outdoor living with upscale entertainment.',
      location: 'Placerville, CA — 3 miles from downtown',
      campgroundFeeEstimate: 'Free (dry camping)',
      campgroundFeeNote:
        'Complimentary dry camping available for casino guests. No hookups available.',
      campgroundFeeDisclaimer:
        'Dry camping means no electrical or water hookups. SunRioVistas will ensure your RV is fully prepared for self-contained stays.',
      hookupAvailable: false,
      activities: [
        'casino entertainment',
        'fine dining',
        'live shows',
        'spa services',
      ],
      highlights: [
        'Free dry camping',
        'World-class entertainment',
        'Award-winning dining',
        'Live shows and events',
      ],
      images: [],
      isActive: true,
      sortOrder: 3,
    },
  })

  const harvestHosts = await prisma.destination.upsert({
    where: { slug: 'harvest-hosts' },
    update: {},
    create: {
      name: 'Harvest Hosts / Winery Locations',
      slug: 'harvest-hosts',
      emoji: '🍇',
      description:
        'Wake up surrounded by vineyard rows with the Harvest Hosts membership network, offering overnight stays at wineries, farms, and unique venues throughout California wine country.',
      longDescription:
        'Harvest Hosts opens the door to one of the most unique glamping experiences available — staying overnight at working wineries, farms, breweries, and golf courses throughout California and beyond. With a Harvest Hosts membership (required, available for purchase), SunRioVistas guests can park their luxury RV right in the vineyards, enjoy complimentary tastings, and fall asleep under the stars surrounded by grapevines. This is dry camping at its most romantic and memorable, perfect for wine lovers, photographers, and anyone seeking a truly one-of-a-kind overnight experience.',
      location: 'Various locations — Northern California Wine Country',
      campgroundFeeEstimate: '$0–$30/night',
      campgroundFeeNote:
        'Harvest Hosts membership required (~$99/year). Some hosts request a minimum purchase. No hookups at most locations.',
      campgroundFeeDisclaimer:
        'Harvest Hosts membership must be purchased separately. SunRioVistas is not affiliated with Harvest Hosts.',
      hookupAvailable: false,
      activities: [
        'wine tasting',
        'vineyard tours',
        'farm-to-table dining',
        'scenic walks',
      ],
      highlights: [
        'Overnight at wineries',
        'Immersive vineyard experience',
        'Unique photo opportunities',
        'Complimentary wine tastings',
      ],
      images: [],
      isActive: true,
      sortOrder: 4,
    },
  })

  const auburn = await prisma.destination.upsert({
    where: { slug: 'auburn-gold-country' },
    update: {},
    create: {
      name: 'Auburn / Gold Country',
      slug: 'auburn-gold-country',
      emoji: '⛏️',
      description:
        'Discover the history and natural beauty of California\'s Gold Country, from gold panning in the American River to hiking through dramatic canyon landscapes.',
      longDescription:
        'Auburn sits at the heart of California\'s legendary Gold Country, offering an extraordinary mix of history, outdoor adventure, and natural beauty. Camp near the American River and spend your days gold panning, kayaking through dramatic gorges, or exploring the trails of Auburn State Recreation Area. The historic Old Town Auburn features charming restaurants, antique shops, and the famous Awful Annie\'s for breakfast. This destination appeals to outdoor enthusiasts, history buffs, and families looking for an educational yet adventurous getaway.',
      location: 'Auburn, CA — Placer County, Gold Country',
      campgroundFeeEstimate: 'Varies',
      campgroundFeeNote:
        'Multiple campground options in the area. Fees range from free dispersed camping to $35+/night at developed sites.',
      campgroundFeeDisclaimer:
        'Campground fees are paid directly to the campground/host and are not included in your SunRioVistas booking total.',
      hookupAvailable: false,
      activities: [
        'gold panning',
        'river kayaking',
        'hiking',
        'historic exploration',
        'mountain biking',
      ],
      highlights: [
        'Historic Gold Rush sites',
        'American River access',
        'World-class hiking trails',
        'Charming Old Town Auburn',
      ],
      images: [],
      isActive: true,
      sortOrder: 5,
    },
  })

  console.log(
    '✅ Destinations created:',
    bealsPoint.name,
    placerville.name,
    redHawk.name,
    harvestHosts.name,
    auburn.name
  )

  // ─────────────────────────────────────────────
  // Add-Ons
  // ─────────────────────────────────────────────

  const addOnData = [
    {
      name: 'Solar Battery Package',
      slug: 'solar-battery',
      basePrice: 75,
      description:
        'Power your devices and stay connected with our portable solar battery pack. Includes a high-capacity solar generator (1,000Wh+) that keeps your phones, laptops, and small appliances running — even off-grid.',
      longDescription:
        'Our Solar Battery Package includes a premium portable solar generator (1,000Wh+ capacity) along with solar panels for continuous daytime charging. Perfect for off-grid destinations or dry camping where electrical hookups aren\'t available. Silently power your essentials without disturbing the peace of nature.',
      sortOrder: 1,
    },
    {
      name: 'Generator Package',
      slug: 'generator',
      basePrice: 50,
      description:
        "Ensure uninterrupted power with our quiet generator package. Ideal for off-grid destinations or when you need reliable power for AC, kitchen appliances, and entertainment.",
      longDescription:
        'Our Generator Package includes a quiet-running inverter generator with enough capacity to power your AC unit, kitchen appliances, and entertainment systems. Includes fuel for your stay and all necessary cables. Our generators are selected for low noise output to maintain the peaceful glamping atmosphere.',
      sortOrder: 2,
    },
    {
      name: 'Firepit Package',
      slug: 'firepit',
      basePrice: 35,
      description:
        "Pre-loaded firepit with kindling, logs, and roasting sticks for s'mores. Everything you need for a perfect campfire night is ready and waiting when you arrive.",
      longDescription:
        "The Firepit Package takes the hassle out of campfire prep. We pre-load your firepit with seasoned firewood, kindling, and fire starters so you can have a roaring fire going within minutes of arrival. Includes enough wood for 2-3 evenings, plus roasting sticks and a s'mores kit with graham crackers, chocolate, and marshmallows.",
      sortOrder: 3,
    },
    {
      name: 'Outdoor Movie Package',
      slug: 'outdoor-movie',
      basePrice: 85,
      description:
        'Portable projector, screen, and Bluetooth speaker for a cinematic outdoor night under the stars. Transform your campsite into a private outdoor theater.',
      longDescription:
        'Experience cinema magic under the open sky with our Outdoor Movie Package. Includes a high-resolution portable projector, 100" inflatable screen, premium Bluetooth speaker, and a curated selection of family-friendly and romantic movie suggestions. Setup is simple, and we\'ll include popcorn to complete the experience. Best enjoyed after dark on clear nights.',
      sortOrder: 4,
    },
    {
      name: 'Bedding Upgrade Package',
      slug: 'bedding-upgrade',
      basePrice: 40,
      description:
        'Premium hotel-quality linens and towels for an elevated sleep experience. Because great adventures start with a great night\'s sleep.',
      longDescription:
        'Upgrade your sleep experience with our premium bedding package. Includes 500-thread-count Egyptian cotton sheets, plush down-alternative duvet, memory foam mattress topper, and hotel-quality towel set for each guest. All linens are freshly laundered and pressed to white-glove standards for your arrival.',
      sortOrder: 5,
    },
    {
      name: 'Couples Package',
      slug: 'couples',
      basePrice: 120,
      description:
        'Rose petals, champagne, candles, chocolates, and a cozy blanket for two. The perfect romantic touch for anniversaries, honeymoons, or any special occasion.',
      longDescription:
        'Celebrate love in style with our Couples Package. Your RV will be adorned with rose petals, flickering LED candles, and soft string lights upon arrival. Includes a chilled bottle of sparkling wine (or non-alcoholic option), artisan chocolates, luxury bath bombs, a cozy fleece blanket, and a heartfelt welcome card personalized with your names. Perfect for anniversaries, honeymoons, proposals, or any romantic getaway.',
      sortOrder: 6,
    },
    {
      name: 'Family Fun Package',
      slug: 'family-fun',
      basePrice: 65,
      description:
        "Board games, s'mores kit, kid-friendly activities, and outdoor toys. Keep the whole family entertained from check-in to checkout.",
      longDescription:
        "The Family Fun Package is packed with activities to keep kids and adults entertained throughout your stay. Includes a curated selection of board games and card games suitable for all ages, a deluxe s'mores kit, bubbles and sidewalk chalk, a nature scavenger hunt guide for the kids, a frisbee and football, and a campfire storytelling card set. Everything you need for an unforgettable family adventure.",
      sortOrder: 7,
    },
    {
      name: 'Early Check-In (12pm)',
      slug: 'early-checkin',
      basePrice: 50,
      description:
        'Check in at 12pm instead of the standard 3pm. Start your glamping adventure three hours earlier and make the most of your day.',
      longDescription:
        'Can\'t wait to start your glamping getaway? With Early Check-In, your RV will be cleaned, prepped, and ready for you by 12pm — three hours ahead of our standard 3pm check-in time. Subject to availability based on the previous booking. We\'ll confirm availability prior to your arrival date.',
      sortOrder: 8,
    },
    {
      name: 'Late Checkout (12pm)',
      slug: 'late-checkout',
      basePrice: 50,
      description:
        'Enjoy checkout at 12pm instead of the standard 10am. Savor those last two hours of your glamping experience.',
      longDescription:
        'Not ready to leave? With Late Checkout, you can enjoy your SunRioVistas RV until 12pm — two hours beyond our standard 10am checkout time. Use that extra time for a final sunrise coffee, a leisurely breakfast, or simply soaking in the last moments of your escape. Subject to availability based on the next booking. We\'ll confirm availability prior to your departure date.',
      sortOrder: 9,
    },
  ]

  for (const addOn of addOnData) {
    await prisma.addOn.upsert({
      where: { slug: addOn.slug },
      update: {},
      create: {
        name: addOn.name,
        slug: addOn.slug,
        basePrice: addOn.basePrice,
        description: addOn.description,
        longDescription: addOn.longDescription,
        isActive: true,
        sortOrder: addOn.sortOrder,
      },
    })
  }

  console.log('✅ Add-ons created:', addOnData.length)

  // ─────────────────────────────────────────────
  // Terms Document
  // ─────────────────────────────────────────────

  await prisma.termsDocument.upsert({
    where: { id: 'terms-v1' },
    update: {},
    create: {
      id: 'terms-v1',
      version: '1.0',
      url: '[ADD_TERMS_AND_CONDITIONS_DOC_LINK_HERE]',
      isActive: true,
    },
  })

  console.log('✅ Terms document created')

  // ─────────────────────────────────────────────
  // Site Settings
  // ─────────────────────────────────────────────

  const settings = [
    { key: 'cleaning_fee', value: '60' },
    { key: 'deposit_enabled', value: 'false' },
    { key: 'deposit_percent', value: '25' },
    { key: 'deposit_amount', value: '0' },
    { key: 'tax_enabled', value: 'false' },
    { key: 'tax_percent', value: '0' },
    { key: 'terms_version', value: '1.0' },
    { key: 'terms_url', value: '[ADD_TERMS_AND_CONDITIONS_DOC_LINK_HERE]' },
    {
      key: 'cancellation_policy',
      value:
        'Full refund for cancellations 7+ days before check-in. 50% refund for cancellations within 7 days. No refund within 48 hours of check-in.',
    },
    {
      key: 'pet_policy',
      value:
        'Pets are considered case-by-case. Please note your pet in the special requests field and our team will review.',
    },
    { key: 'min_nights', value: '2' },
    { key: 'admin_email', value: 'admin@sunriovistas.com' },
  ]

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('✅ Site settings created:', settings.length)
  console.log('🎉 Database seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
