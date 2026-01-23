import { X, Building2, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function ControlFormModal({ isOpen, onClose, onSubmit, cities = [] }) {
    const [selection, setSelection] = useState(null); // null, 'city', 'chapter'
    const [formData, setFormData] = useState({
        level: '',
        cityName: '',
        givenTo: '',
        password: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let subType = '';
        let subLevel = '';

        if (selection === 'city') {
            subType = formData.level; // The City Name
            subLevel = 'City';
        } else {
            subType = formData.level; // The Chapter Name
            subLevel = formData.cityName; // The Selected City
        }

        onSubmit({
            type: subType,
            level: subLevel,
            givenTo: formData.givenTo,
            password: formData.password
        });
        handleClose();
    };

    const handleClose = () => {
        onClose();
        setSelection(null); // Reset on close
        setFormData({ level: '', cityName: '', givenTo: '', password: '' });
    };

    return (
        <div className="modal-overlay animate-fade-in" onClick={handleClose}>
            <div className="modal-content control-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {selection === 'city' ? 'City Password Control' :
                            selection === 'chapter' ? 'Chapter Password Control' :
                                'Control Passwords'}
                    </h2>
                    <button className="close-btn" onClick={handleClose} aria-label="Close">
                        <X size={24} />
                    </button>
                </div>

                {!selection ? (
                    <div className="selection-view animate-fade-in">
                        <p className="selection-label">What would you like to control?</p>
                        <div className="selection-grid">
                            <button className="selection-card" onClick={() => setSelection('city')}>
                                <div className="selection-icon-wrapper city">
                                    <Building2 size={32} />
                                </div>
                                <span className="selection-title">City</span>
                                <span className="selection-desc">Manage passwords for city level</span>
                            </button>
                            <button className="selection-card" onClick={() => setSelection('chapter')}>
                                <div className="selection-icon-wrapper chapter">
                                    <MapPin size={32} />
                                </div>
                                <span className="selection-title">Chapter</span>
                                <span className="selection-desc">Manage passwords for chapter level</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="control-form animate-slide-up">
                        {selection === 'city' && (
                            <div className="form-section">
                                <label className="field-label">Select City</label>
                                <input
                                    type="text"
                                    name="level"
                                    value={formData.level}
                                    onChange={handleChange}
                                    placeholder="City Name"
                                    className="control-input full-width-field"
                                    required
                                />
                                <div className="field-group">
                                    <div className="field-item">
                                        <label className="field-label">Given To</label>
                                        <input
                                            type="text"
                                            name="givenTo"
                                            value={formData.givenTo}
                                            onChange={handleChange}
                                            placeholder="Person Name"
                                            className="control-input"
                                            required
                                        />
                                    </div>
                                    <div className="field-item">
                                        <label className="field-label">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Password"
                                            className="control-input"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {selection === 'chapter' && (
                            <div className="form-section">
                                <label className="field-label">Select City</label>
                                <select
                                    name="cityName"
                                    value={formData.cityName}
                                    onChange={handleChange}
                                    className="control-input full-width-field"
                                    required
                                >
                                    <option value="" disabled>Choose a city</option>
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>

                                <label className="field-label" style={{ marginTop: 'var(--spacing-md)' }}>Select Chapter</label>
                                <input
                                    type="text"
                                    name="level"
                                    value={formData.level}
                                    onChange={handleChange}
                                    placeholder="Chapter Name"
                                    className="control-input full-width-field"
                                    required
                                />
                                <div className="field-group">
                                    <div className="field-item">
                                        <label className="field-label">Given To</label>
                                        <input
                                            type="text"
                                            name="givenTo"
                                            value={formData.givenTo}
                                            onChange={handleChange}
                                            placeholder="Person Name"
                                            className="control-input"
                                            required
                                        />
                                    </div>
                                    <div className="field-item">
                                        <label className="field-label">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Password"
                                            className="control-input"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="modal-footer">
                            <button type="button" className="outline-btn" style={{ marginRight: 'auto' }} onClick={() => setSelection(null)}>Back</button>
                            <button type="submit" className="submit-btn primary-btn">Apply Controls</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
