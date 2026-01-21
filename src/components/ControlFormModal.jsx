import { X } from 'lucide-react';

export default function ControlFormModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onClose();
    };

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="modal-content control-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Control Passwords</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Close">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="control-form">
                    {/* Country Section */}
                    <div className="form-section">
                        <input type="text" placeholder="Country" className="control-input full-width-field" required />
                        <div className="field-group">
                            <input type="text" placeholder="Given to" className="control-input" required />
                            <input type="password" placeholder="Password" className="control-input" required />
                        </div>
                    </div>

                    {/* City Section */}
                    <div className="form-section">
                        <input type="text" placeholder="City" className="control-input full-width-field" required />
                        <div className="field-group">
                            <input type="text" placeholder="Given to" className="control-input" required />
                            <input type="password" placeholder="Password" className="control-input" required />
                        </div>
                    </div>

                    {/* Chapter Section */}
                    <div className="form-section">
                        <input type="text" placeholder="Name Chapter" className="control-input full-width-field" required />
                        <div className="field-group">
                            <input type="text" placeholder="Given to" className="control-input" required />
                            <input type="password" placeholder="Password" className="control-input" required />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn primary-btn">Apply Controls</button>
                </form>
            </div>
        </div>
    );
}
