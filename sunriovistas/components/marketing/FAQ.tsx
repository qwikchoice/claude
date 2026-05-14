'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export const faqItems = [
  {
    question: 'Do I need to drive the RV?',
    answer:
      'No! You never drive the RV. You simply drive your own car to the campground or destination, where the RV is already fully setup and ready for you. This is stationary glamping — the RV stays put and you come to it.',
  },
  {
    question: 'Is RV insurance required?',
    answer:
      'Absolutely not. Since you are not driving the RV, no RV insurance is required whatsoever. Just drive your regular car as you normally would. No special license, no special insurance — just show up.',
  },
  {
    question: 'Are campground fees included in my booking?',
    answer:
      'Campground fees are not included in your booking total and are paid directly to the campground or host on arrival. We provide estimated fees for each destination so you can plan accordingly. These fees go entirely to the campground — we do not mark them up.',
  },
  {
    question: "What's included in the cleaning fee?",
    answer:
      "The $60 cleaning fee covers professional cleaning between every guest stay. It ensures you arrive to a spotless, fresh RV every time. This fee is mandatory and applies to every booking regardless of stay length.",
  },
  {
    question: 'Can beginners enjoy this?',
    answer:
      'Absolutely! This experience is specifically designed to be beginner-friendly. No RV knowledge required — we handle all the technical setup, hookups, and preparation. You just show up, unpack, and relax. Many of our happiest guests had never set foot in an RV before.',
  },
  {
    question: 'Can I bring my kids?',
    answer:
      'Yes! Lunaris is especially popular for families with children. All RVs are family-friendly and can accommodate children. Please mention the ages and number of children in your booking request so we can ensure the best setup.',
  },
  {
    question: 'Are pets allowed?',
    answer:
      'Pets are considered on a case-by-case basis. Please mention your pet (breed, size, and number) in the special requests field during booking. Our team will review and confirm. Note that some campground destinations may have their own pet policies.',
  },
  {
    question: 'Why does my booking require approval?',
    answer:
      'We manually review each booking to ensure the best possible experience for all guests. This lets us confirm your dates, destination compatibility, group size, and any special requests before sending your payment link. We typically respond within 24 hours.',
  },
  {
    question: 'What is the minimum stay?',
    answer:
      'We require a minimum 2-night stay for all bookings. This ensures you have enough time to truly settle in, explore the destination, and enjoy the full glamping experience without feeling rushed.',
  },
  {
    question: 'Can I use this as a couple or solo traveler?',
    answer:
      'Absolutely! Stellaris is our most popular pick for solo wellness travelers and couples seeking a soulful retreat. Lunaris is perfect for romantic weekend escapes. Solaris is great for adventurous solo road trips to wine country.',
  },
]

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  index: number
}

function FAQItem({ question, answer, isOpen, onToggle, index }: FAQItemProps) {
  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 ${
        isOpen ? 'border-amber-300 shadow-sm' : 'border-stone-200'
      }`}
    >
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-200 ${
          isOpen ? 'bg-amber-50' : 'bg-white hover:bg-stone-50'
        }`}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
      >
        <span className={`font-semibold text-base ${isOpen ? 'text-amber-800' : 'text-stone-900'}`}>
          {question}
        </span>
        <ChevronDown
          size={20}
          className={`flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-amber-600' : 'text-stone-400'
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-question-${index}`}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="px-6 py-5 bg-white border-t border-amber-100">
          <p className="text-stone-600 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  return (
    <section className="section-padding bg-white" aria-labelledby="faq-title">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 id="faq-title" className="section-title mb-4">
            Frequently Asked Questions
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Everything you need to know before booking your luxury glamping experience.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <FAQItem
              key={i}
              index={i}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <p className="text-stone-700 font-medium mb-1">Still have questions?</p>
          <p className="text-stone-500 text-sm mb-4">
            We&apos;re happy to help. Reach out and we&apos;ll respond within 24 hours.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-full text-sm shadow hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            Ask Us a Question
          </a>
        </div>
      </div>
    </section>
  )
}
