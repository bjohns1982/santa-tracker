// Static demo page for Twilio campaign approval
// This page shows the exact opt-in form without any functionality
// URL: /signup/demo

export default function FamilySignUpDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-holiday-red via-red-600 to-holiday-green p-4">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-5xl mb-4">🎅</h1>
            <h2 className="text-3xl font-bold text-holiday-red mb-2">
              Sign Up for Santa's Visit!
            </h2>
            <p className="text-gray-600">Tour: Test Tour for Twilio Campaign Approval</p>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Street Number *
                </label>
                <input
                  type="text"
                  className="input-field"
                  disabled
                  placeholder="123"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  Street Name *
                </label>
                <input
                  type="text"
                  className="input-field"
                  disabled
                  placeholder="Main Street"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Family Name *
              </label>
              <input
                type="text"
                className="input-field"
                disabled
                placeholder="Smith"
              />
            </div>

            {/* SMS Opt-In Section - This is what Twilio reviewers need to see */}
            <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="smsOptIn"
                  checked={true}
                  readOnly
                  className="w-5 h-5 text-holiday-red border-gray-300 rounded focus:ring-holiday-red"
                />
                <label
                  htmlFor="smsOptIn"
                  className="ml-2 text-gray-700 font-semibold"
                >
                  Yes, send me text message updates about Santa's visit.
                </label>
              </div>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Primary Phone Number * <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    disabled
                    placeholder="+1 (XXX) XXX-XXXX"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Secondary Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    disabled
                    placeholder="+1 (XXX) XXX-XXXX"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  By checking this box and providing your mobile number, you
                  agree to receive 3-5 text messages on the day of the Santa
                  Tour about your schedule and Santa's ETA. Message & data
                  rates may apply. Reply STOP to opt out at any time, or HELP
                  for help. See our{" "}
                  <a
                    href="/terms"
                    className="text-holiday-red hover:underline"
                  >
                    Terms
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="text-holiday-red hover:underline"
                  >
                    Privacy Policy
                  </a>{" "}
                  at www.santa-tour.com/terms and www.santa-tour.com/privacy.
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-gray-700 font-semibold">
                  Children *
                </label>
                <button
                  type="button"
                  disabled
                  className="text-holiday-red font-semibold hover:underline opacity-50 cursor-not-allowed"
                >
                  + Add Child
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 border-2 border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        disabled
                        placeholder="Tommy"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Special Instructions for Santa
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      disabled
                      placeholder="Tommy is looking for a bike, Julie's been sad lately..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Help Santa personalize the visit! Share gift ideas,
                      things to celebrate, or ways to encourage.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="btn-primary w-full text-lg py-4 opacity-50 cursor-not-allowed"
            >
              Sign Up for Santa's Visit! 🎅
            </button>
          </form>

          <div className="mt-6">
            <p className="text-center text-gray-600 text-sm">
              Already signed up?{" "}
              <a
                href="/lookup/demo"
                className="text-holiday-red font-semibold hover:underline"
              >
                Find your family view here
              </a>
            </p>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-600">
            <p className="font-semibold mb-1">Note for Twilio Reviewers:</p>
            <p>This is a static demo page showing the opt-in form. The actual signup form is available at /signup/[tourCode] for real tour participants. This demo page demonstrates the exact UI, consent language, and opt-in mechanism used in the production application.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

