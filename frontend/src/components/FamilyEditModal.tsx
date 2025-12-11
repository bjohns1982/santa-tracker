import { useState, useEffect } from "react";
import PhoneNumberInput from "./Shared/PhoneNumberInput";

interface ChildForm {
  id?: string;
  firstName: string;
  specialInstructions?: string;
}

interface FamilyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    streetNumber: string;
    streetName: string;
    familyName: string;
    children: ChildForm[];
    phoneNumber1?: string | null;
    phoneNumber2?: string | null;
    smsOptIn?: boolean;
  }) => Promise<void>;
  family: {
    streetNumber: string;
    streetName: string;
    familyName: string;
    phoneNumber1?: string | null;
    phoneNumber2?: string | null;
    smsOptIn?: boolean;
    children: {
      id: string;
      firstName: string;
      specialInstructions?: string | null;
    }[];
    tour?: {
      name: string;
    };
  } | null;
  loading?: boolean;
}

export default function FamilyEditModal({
  isOpen,
  onClose,
  onSave,
  family,
  loading = false,
}: FamilyEditModalProps) {
  const [streetNumber, setStreetNumber] = useState("");
  const [streetName, setStreetName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [children, setChildren] = useState<ChildForm[]>([
    { firstName: "", specialInstructions: "" },
  ]);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [phoneNumber1, setPhoneNumber1] = useState("");
  const [phoneNumber2, setPhoneNumber2] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (family && isOpen) {
      setStreetNumber(family.streetNumber);
      setStreetName(family.streetName);
      setFamilyName(family.familyName);
      setSmsOptIn(family.smsOptIn || false);
      setPhoneNumber1(family.phoneNumber1 || "");
      setPhoneNumber2(family.phoneNumber2 || "");
      setChildren(
        family.children.map((child) => ({
          id: child.id,
          firstName: child.firstName,
          specialInstructions: child.specialInstructions ?? "",
        })) || [{ firstName: "", specialInstructions: "" }]
      );
      setError("");
      setPhoneError("");
    }
  }, [family, isOpen]);

  const addChild = () => {
    setChildren([...children, { firstName: "", specialInstructions: "" }]);
  };

  const removeChild = (index: number) => {
    if (children.length === 1) return;
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (
    index: number,
    field: keyof ChildForm,
    value: string
  ) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!streetNumber.trim() || !streetName.trim() || !familyName.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (children.some((child) => !child.firstName.trim())) {
      setError("Please provide first names for all children.");
      return;
    }

    // Validate phone numbers if SMS opt-in is enabled
    if (smsOptIn) {
      if (
        !phoneNumber1 ||
        phoneNumber1.length !== 12 ||
        !phoneNumber1.startsWith("+1")
      ) {
        setPhoneError(
          "Primary phone number is required and must be in format +1XXXXXXXXXX"
        );
        return;
      }
      if (
        phoneNumber2 &&
        (phoneNumber2.length !== 12 || !phoneNumber2.startsWith("+1"))
      ) {
        setPhoneError("Secondary phone number must be in format +1XXXXXXXXXX");
        return;
      }
    }

    setPhoneError("");
    setSaving(true);
    try {
      await onSave({
        streetNumber: streetNumber.trim(),
        streetName: streetName.trim(),
        familyName: familyName.trim(),
        children: children.map((child) => ({
          id: child.id,
          firstName: child.firstName.trim(),
          specialInstructions: child.specialInstructions?.trim() || undefined,
        })),
        phoneNumber1: smsOptIn ? phoneNumber1 : null,
        phoneNumber2: smsOptIn && phoneNumber2 ? phoneNumber2 : null,
        smsOptIn,
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save family details. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !family) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="card max-w-3xl w-full max-h-[90vh] overflow-y-auto relative z-[10000]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-holiday-red">
              Edit Family Details
            </h2>
            <p className="text-gray-600 mt-1">
              Update your address or add helpful notes so Santa can personalize
              the visit.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Street Number *
              </label>
              <input
                type="text"
                value={streetNumber}
                onChange={(e) => setStreetNumber(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Street Name *
              </label>
              <input
                type="text"
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Family Name *
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* SMS Opt-In Section */}
          <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="smsOptIn"
                checked={smsOptIn}
                onChange={(e) => {
                  setSmsOptIn(e.target.checked);
                  if (!e.target.checked) {
                    setPhoneNumber1("");
                    setPhoneNumber2("");
                    setPhoneError("");
                  }
                }}
                className="w-5 h-5 text-holiday-red border-gray-300 rounded focus:ring-holiday-red"
              />
              <label
                htmlFor="smsOptIn"
                className="ml-2 text-gray-700 font-semibold"
              >
                Yes, send me text message updates about Santa's visit.
              </label>
            </div>
            {smsOptIn && (
              <div className="space-y-4 mt-4">
                <PhoneNumberInput
                  value={phoneNumber1}
                  onChange={setPhoneNumber1}
                  label="Primary Phone Number"
                  required={true}
                  error={phoneError && phoneNumber1 ? phoneError : undefined}
                />
                <PhoneNumberInput
                  value={phoneNumber2}
                  onChange={setPhoneNumber2}
                  label="Secondary Phone Number (Optional)"
                  required={false}
                />
                <p className="text-xs text-gray-500 mt-2">
                  By checking this box and providing your mobile number, you
                  agree to receive 3-5 text messages on the day of the Santa Tour about your schedule and
                  Santa's ETA. Message & data rates may apply. Reply STOP to opt
                  out at any time, or HELP for help. See our{" "}
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
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-gray-700 font-semibold">
                Children *
              </label>
              <button
                type="button"
                onClick={addChild}
                className="text-holiday-red font-semibold hover:underline"
              >
                + Add Child
              </button>
            </div>

            <div className="space-y-4">
              {children.map((child, index) => (
                <div
                  key={index}
                  className="p-4 border-2 border-gray-200 rounded-lg space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={child.firstName}
                        onChange={(e) =>
                          updateChild(index, "firstName", e.target.value)
                        }
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Special Instructions
                      </label>
                      <input
                        type="text"
                        value={child.specialInstructions || ""}
                        onChange={(e) =>
                          updateChild(
                            index,
                            "specialInstructions",
                            e.target.value
                          )
                        }
                        className="input-field"
                        placeholder="Tommy is looking for a bike..."
                      />
                    </div>
                  </div>
                  {children.length > 1 && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => removeChild(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove Child
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={saving || loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving || loading}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
