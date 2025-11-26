import { useState, useEffect } from 'react';

type ChildForm = {
  id?: string;
  firstName: string;
  specialInstructions?: string;
};

type Family = {
  id: string;
  streetNumber: string;
  streetName: string;
  familyName: string;
  children: ChildForm[];
};

type FamilyEditModalProps = {
  family: Family | null;
  onClose: () => void;
  onSave: (data: {
    streetNumber: string;
    streetName: string;
    familyName: string;
    children: ChildForm[];
  }) => Promise<void>;
};

export default function FamilyEditModal({ family, onClose, onSave }: FamilyEditModalProps) {
  const [streetNumber, setStreetNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [children, setChildren] = useState<ChildForm[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (family) {
      setStreetNumber(family.streetNumber);
      setStreetName(family.streetName);
      setFamilyName(family.familyName);
      setChildren(
        family.children.length > 0
          ? family.children.map((child) => ({
              id: child.id,
              firstName: child.firstName,
              specialInstructions: child.specialInstructions || '',
            }))
          : [{ firstName: '', specialInstructions: '' }]
      );
    }
  }, [family]);

  if (!family) return null;

  const handleChildChange = (index: number, field: keyof ChildForm, value: string) => {
    setChildren((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddChild = () => {
    setChildren((prev) => [...prev, { firstName: '', specialInstructions: '' }]);
  };

  const handleRemoveChild = (index: number) => {
    setChildren((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!streetNumber.trim() || !streetName.trim() || !familyName.trim()) {
      setError('Street number, street name, and family name are required.');
      return;
    }

    if (children.length === 0 || children.some((c) => !c.firstName.trim())) {
      setError('Each child must have a first name.');
      return;
    }

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
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save family details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-holiday-red">Edit Family Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Street Number *</label>
              <input
                type="text"
                value={streetNumber}
                onChange={(e) => setStreetNumber(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Street Name *</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-1">Family Name *</label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">Children *</label>
              <button
                type="button"
                onClick={handleAddChild}
                className="text-holiday-red font-semibold text-sm hover:underline"
              >
                + Add Child
              </button>
            </div>

            <div className="space-y-3">
              {children.map((child, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">First Name *</label>
                      <input
                        type="text"
                        value={child.firstName}
                        onChange={(e) => handleChildChange(index, 'firstName', e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">Special Instructions</label>
                      <input
                        type="text"
                        value={child.specialInstructions || ''}
                        onChange={(e) => handleChildChange(index, 'specialInstructions', e.target.value)}
                        className="input-field"
                        placeholder="Tommy is excited for Legos..."
                      />
                    </div>
                  </div>

                  {children.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChild(index)}
                      className="text-red-500 text-xs font-semibold hover:underline"
                    >
                      Remove Child
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
             .disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
