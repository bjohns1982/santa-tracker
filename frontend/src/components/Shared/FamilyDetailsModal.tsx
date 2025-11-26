// Family Details Modal Component

interface Child {
  id: string;
  firstName: string;
  specialInstructions?: string | null;
}

interface Family {
  id: string;
  familyName: string;
  streetNumber: string;
  streetName: string;
  children: Child[];
}

interface FamilyDetailsModalProps {
  family: Family | null;
  onClose: () => void;
}

export default function FamilyDetailsModal({ family, onClose }: FamilyDetailsModalProps) {
  if (!family) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-holiday-red">{family.familyName}</h2>
            <p className="text-gray-600 mt-1">
              {family.streetNumber} {family.streetName}
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

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-holiday-red mb-3">
              Children ({family.children.length})
            </h3>
            <div className="space-y-3">
              {family.children.map((child) => (
                <div
                  key={child.id}
                  className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">👶</div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{child.firstName}</p>
                      {child.specialInstructions ? (
                        <div className="mt-2">
                          <p className="text-sm font-semibold text-gray-700 mb-1">
                            Special Instructions for Santa:
                          </p>
                          <p className="text-gray-600 bg-white p-3 rounded border border-gray-300">
                            {child.specialInstructions}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic mt-1">
                          No special instructions provided
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

