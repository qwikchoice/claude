'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { faqItems } from './faq-data'

export { faqItems }

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
