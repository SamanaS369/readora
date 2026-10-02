import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started with Readora.",
    button: "Current Plan",
    popular: false,
    features: [
      "Read up to 5 books",
      "Save books to your library",
      "Write and publish stories",
      "Basic AI writing assistance",
      "Access to free stories",
    ],
  },
  {
    name: "Premium",
    price: "$5",
    description: "For readers and writers who want more.",
    button: "Upgrade to Premium",
    popular: true,
    features: [
      "Unlimited book reading",
      "Access to premium books",
      "Unlimited personal library",
      "Advanced AI writing assistance",
      "Grammar and spelling suggestions",
      "Sentence improvement",
      "Priority access to new stories",
      "Premium-only stories",
    ],
  },
];

const premiumFeatures = [
  {
    icon: "📚",
    title: "Unlimited Reading",
    description:
      "Read as many books and stories as you want without the free reading limit.",
  },
  {
    icon: "🤖",
    title: "Advanced AI Assistant",
    description:
      "Improve grammar, spelling, sentence structure, clarity, and wording while writing.",
  },
  {
    icon: "⭐",
    title: "Premium Stories",
    description:
      "Explore books and stories that are available exclusively to premium readers.",
  },
  {
    icon: "💾",
    title: "Unlimited Library",
    description:
      "Save and organize your favorite books without the free-plan limitation.",
  },
  {
    icon: "✍️",
    title: "Better Writing Tools",
    description:
      "Get additional tools to help develop and improve your stories.",
  },
  {
    icon: "🚀",
    title: "Early Access",
    description:
      "Discover selected new stories and platform features before free users.",
  },
];

const faqs = [
  {
    question: "Can I use Readora for free?",
    answer:
      "Yes. Readora has a free plan that lets you read up to 5 books, save books, write stories, and use basic AI writing assistance.",
  },
  {
    question: "What does Premium include?",
    answer:
      "Premium provides unlimited reading, premium stories, an expanded library, and advanced AI writing features.",
  },
  {
    question: "Can I cancel Premium?",
    answer:
      "Yes. Once the payment system is connected, users will be able to manage and cancel their subscription from their account.",
  },
  {
    question: "Can writers publish stories on the free plan?",
    answer:
      "Yes. Writers can create and publish stories without needing a Premium subscription.",
  },
];

export default function PremiumPage() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">

          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-5 py-2 rounded-full text-sm font-medium">
            ✨ Readora Premium
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mt-6">
            Read More.
            <br />
            Write More.
            <br />
            Create More.
          </h1>

          <p className="max-w-2xl mx-auto text-purple-100 text-lg mt-6 leading-8">
            Unlock unlimited reading, premium stories, and powerful AI
            writing tools with Readora Premium.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">

            <a
              href="#plans"
              className="bg-white text-purple-700 px-7 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              View Plans
            </a>

            <Link
              href="/books"
              className="border border-white/50 text-white px-7 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Explore Books
            </Link>

          </div>

        </div>
      </section>

      {/* ================= BENEFITS ================= */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">

          <div className="text-center max-w-2xl mx-auto">

            <p className="text-purple-600 font-semibold">
              PREMIUM BENEFITS
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Everything You Need to Enjoy Readora
            </h2>

            <p className="text-gray-600 mt-4">
              Premium gives readers and writers additional tools and access
              while keeping the core Readora experience available for free.
            </p>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">

            {premiumFeatures.map((feature) => (
              <div
                key={feature.title}
                className="border border-gray-200 rounded-2xl p-6 bg-white hover:shadow-lg transition"
              >

                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center text-3xl">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-5">
                  {feature.title}
                </h3>

                <p className="text-gray-600 mt-3 leading-7">
                  {feature.description}
                </p>

              </div>
            ))}

          </div>

        </div>
      </section>

      {/* ================= PLANS ================= */}
      <section
        id="plans"
        className="bg-gray-50 py-16"
      >
        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center">

            <p className="text-purple-600 font-semibold">
              SIMPLE PRICING
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Choose Your Readora Plan
            </h2>

            <p className="text-gray-600 mt-3">
              Start for free or unlock the full Readora experience.
            </p>

          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">

            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl p-8 ${
                  plan.popular
                    ? "border-2 border-purple-600 shadow-xl"
                    : "border border-gray-200 shadow-sm"
                }`}
              >

                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </h3>

                <p className="text-gray-600 mt-2">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mt-7 flex items-end gap-2">

                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price}
                  </span>

                  {plan.price !== "$0" && (
                    <span className="text-gray-500 mb-2">
                      /month
                    </span>
                  )}

                </div>

                {/* Features */}
                <div className="mt-8 space-y-4">

                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3"
                    >

                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold mt-0.5">
                        ✓
                      </span>

                      <span className="text-gray-700">
                        {feature}
                      </span>

                    </div>
                  ))}

                </div>

                {/* Button */}
                {plan.popular ? (
                  <button
                    type="button"
                    className="w-full mt-8 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    {plan.button}
                  </button>
                ) : (
                  <Link
                    href="/books"
                    className="block text-center w-full mt-8 border border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition"
                  >
                    {plan.button}
                  </Link>
                )}

              </div>
            ))}

          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Payment and subscription management will be connected later.
          </p>

        </div>
      </section>

      {/* ================= COMPARISON ================= */}
      <section className="bg-white py-16">

        <div className="max-w-5xl mx-auto px-6">

          <div className="text-center mb-10">

            <h2 className="text-3xl font-bold text-gray-900">
              Free vs Premium
            </h2>

            <p className="text-gray-600 mt-2">
              See what is included with each plan.
            </p>

          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-2xl">

            <table className="w-full text-left">

              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-900">
                    Feature
                  </th>

                  <th className="px-6 py-4 text-center font-semibold text-gray-900">
                    Free
                  </th>

                  <th className="px-6 py-4 text-center font-semibold text-purple-700">
                    Premium
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">

                <ComparisonRow
                  feature="Book reading"
                  free="Up to 5 books"
                  premium="Unlimited"
                />

                <ComparisonRow
                  feature="Premium books"
                  free="No"
                  premium="Yes"
                />

                <ComparisonRow
                  feature="Save books"
                  free="Yes"
                  premium="Yes"
                />

                <ComparisonRow
                  feature="Personal library"
                  free="Limited"
                  premium="Unlimited"
                />

                <ComparisonRow
                  feature="Write stories"
                  free="Yes"
                  premium="Yes"
                />

                <ComparisonRow
                  feature="Basic AI assistance"
                  free="Yes"
                  premium="Yes"
                />

                <ComparisonRow
                  feature="Advanced AI tools"
                  free="No"
                  premium="Yes"
                />

                <ComparisonRow
                  feature="Premium stories"
                  free="No"
                  premium="Yes"
                />

              </tbody>

            </table>

          </div>

        </div>

      </section>

      {/* ================= FAQ ================= */}
      <section className="bg-gray-50 py-16">

        <div className="max-w-4xl mx-auto px-6">

          <div className="text-center">

            <p className="text-purple-600 font-semibold">
              FAQ
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-2">
              Frequently Asked Questions
            </h2>

          </div>

          <div className="mt-10 space-y-4">

            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="bg-white border border-gray-200 rounded-xl p-5 group"
              >

                <summary className="cursor-pointer font-semibold text-gray-900 list-none flex items-center justify-between">
                  {faq.question}

                  <span className="text-purple-600 text-xl group-open:rotate-45 transition">
                    +
                  </span>
                </summary>

                <p className="text-gray-600 leading-7 mt-4">
                  {faq.answer}
                </p>

              </details>
            ))}

          </div>

        </div>

      </section>

      {/* ================= CTA ================= */}
      <section className="bg-purple-700 py-16">

        <div className="max-w-4xl mx-auto px-6 text-center">

          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Start Your Reading Journey
          </h2>

          <p className="text-purple-100 mt-4 text-lg">
            Discover stories, write your own, and become part of the Readora
            community.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">

            <Link
              href="/books"
              className="bg-white text-purple-700 px-7 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Explore Books
            </Link>

            <Link
              href="/write"
              className="border border-white text-white px-7 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Start Writing
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}


/* ================= COMPARISON ROW ================= */

function ComparisonRow({ feature, free, premium }) {
  return (
    <tr>
      <td className="px-6 py-4 text-gray-700 font-medium">
        {feature}
      </td>

      <td className="px-6 py-4 text-center text-gray-600">
        {free}
      </td>

      <td className="px-6 py-4 text-center text-purple-700 font-medium">
        {premium}
      </td>
    </tr>
  );
}
