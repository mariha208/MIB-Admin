import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Trash2, Image, Film, Plus, X, Eye, Loader } from 'lucide-react';

const API_BASE_URL = 'https://mib-backend.mibforindia.workers.dev/api/v1';

export default function SponsorPage() {
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [dragOver, setDragOver] = useState(null); // 'image' | 'video' | null
    const [previewMedia, setPreviewMedia] = useState(null);
    const [sponsorName, setSponsorName] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
    const [videoPreviewUrls, setVideoPreviewUrls] = useState([]);

    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    // Helper to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('mib-admin-token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    // Fetch sponsors from backend on mount
    useEffect(() => {
        fetchSponsors();
    }, []);

    const fetchSponsors = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('mib-admin-token');
            const res = await fetch(`${API_BASE_URL}/sponsors`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setSponsors(data.data);
            } else {
                console.error('[SponsorPage] Failed to fetch sponsors:', data);
                setSponsors([]);
            }
        } catch (err) {
            console.error('[SponsorPage] Fetch error:', err);
            setSponsors([]);
        } finally {
            setLoading(false);
        }
    };

    // Upload file to R2 via backend
    const uploadFile = async (file, type) => {
        const token = localStorage.getItem('mib-admin-token');
        if (!token) throw new Error('Not authenticated');

        const formData = new FormData();
        formData.append('file', file);

        const endpoint = type === 'image' ? '/upload/image' : '/upload/video';
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || data.message || `Upload failed: ${response.status}`);
        }

        return data.data; // { key, url, size, contentType }
    };

    // Handle image selection
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setSelectedImages(prev => [...prev, ...files]);
        const newPreviews = files.map(f => URL.createObjectURL(f));
        setImagePreviewUrls(prev => [...prev, ...newPreviews]);
    };

    // Handle video selection
    const handleVideoSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setSelectedVideos(prev => [...prev, ...files]);
        const newPreviews = files.map(f => URL.createObjectURL(f));
        setVideoPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    // Remove selected image before upload
    const removeSelectedImage = (index) => {
        URL.revokeObjectURL(imagePreviewUrls[index]);
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    // Remove selected video before upload
    const removeSelectedVideo = (index) => {
        URL.revokeObjectURL(videoPreviewUrls[index]);
        setSelectedVideos(prev => prev.filter((_, i) => i !== index));
        setVideoPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    // Handle drag events
    const handleDragOver = (e, zone) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(zone);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(null);
    };

    const handleDrop = (e, zone) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(null);

        const files = Array.from(e.dataTransfer.files);
        if (zone === 'image') {
            const imageFiles = files.filter(f => f.type.startsWith('image/'));
            if (imageFiles.length > 0) {
                setSelectedImages(prev => [...prev, ...imageFiles]);
                const newPreviews = imageFiles.map(f => URL.createObjectURL(f));
                setImagePreviewUrls(prev => [...prev, ...newPreviews]);
            }
        } else if (zone === 'video') {
            const videoFiles = files.filter(f => f.type.startsWith('video/'));
            if (videoFiles.length > 0) {
                setSelectedVideos(prev => [...prev, ...videoFiles]);
                const newPreviews = videoFiles.map(f => URL.createObjectURL(f));
                setVideoPreviewUrls(prev => [...prev, ...newPreviews]);
            }
        }
    };

    // Submit sponsor with all media — uploads files to R2, then saves sponsor to DB
    const handleSubmitSponsor = async () => {
        if (!sponsorName.trim()) {
            alert('Please enter a sponsor name.');
            return;
        }
        if (selectedImages.length === 0 && selectedVideos.length === 0) {
            alert('Please select at least one image or video.');
            return;
        }

        setUploading(true);
        setUploadProgress('Uploading media...');

        try {
            const uploadedImages = [];
            const uploadedVideos = [];

            // Upload images to R2
            for (let i = 0; i < selectedImages.length; i++) {
                setUploadProgress(`Uploading image ${i + 1} of ${selectedImages.length}...`);
                const result = await uploadFile(selectedImages[i], 'image');
                uploadedImages.push({
                    key: result.key,
                    url: result.url,
                    size: result.size,
                    contentType: result.contentType,
                    originalName: selectedImages[i].name,
                });
            }

            // Upload videos to R2
            for (let i = 0; i < selectedVideos.length; i++) {
                setUploadProgress(`Uploading video ${i + 1} of ${selectedVideos.length}...`);
                const result = await uploadFile(selectedVideos[i], 'video');
                uploadedVideos.push({
                    key: result.key,
                    url: result.url,
                    size: result.size,
                    contentType: result.contentType,
                    originalName: selectedVideos[i].name,
                });
            }

            // Save sponsor + media references to the backend DB
            setUploadProgress('Saving sponsor...');
            const token = localStorage.getItem('mib-admin-token');
            const res = await fetch(`${API_BASE_URL}/sponsors`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: sponsorName.trim(),
                    images: uploadedImages,
                    videos: uploadedVideos,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || data.message || 'Failed to save sponsor');
            }

            // Re-fetch sponsors from backend to stay in sync
            await fetchSponsors();

            // Reset form
            setSponsorName('');
            setSelectedImages([]);
            setSelectedVideos([]);
            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
            videoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
            setImagePreviewUrls([]);
            setVideoPreviewUrls([]);
            setShowAddForm(false);

            alert('Sponsor added successfully!');
        } catch (error) {
            console.error('[SponsorPage] Upload error:', error);
            alert('Failed to upload: ' + error.message);
        } finally {
            setUploading(false);
            setUploadProgress('');
        }
    };

    // Delete a sponsor (backend)
    const handleDeleteSponsor = async (sponsorId) => {
        if (!window.confirm('Are you sure you want to delete this sponsor?')) return;
        try {
            const token = localStorage.getItem('mib-admin-token');
            const res = await fetch(`${API_BASE_URL}/sponsors/${sponsorId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete sponsor');
            }
            // Remove from local state
            setSponsors(prev => prev.filter(s => s.id !== sponsorId));
        } catch (err) {
            console.error('[SponsorPage] Delete error:', err);
            alert('Failed to delete sponsor: ' + err.message);
        }
    };

    // Delete individual media from a sponsor (backend)
    const handleDeleteMedia = async (sponsorId, mediaType, mediaIndex) => {
        if (!window.confirm('Remove this media?')) return;

        // Find the media item to get its ID
        const sponsorObj = sponsors.find(s => s.id === sponsorId);
        if (!sponsorObj) return;

        const mediaList = mediaType === 'image' ? sponsorObj.images : sponsorObj.videos;
        const mediaItem = mediaList[mediaIndex];
        if (!mediaItem || !mediaItem.id) {
            // Fallback: just remove from local state if no ID
            setSponsors(prev => prev.map(s => {
                if (s.id !== sponsorId) return s;
                const updated = { ...s };
                if (mediaType === 'image') {
                    updated.images = s.images.filter((_, i) => i !== mediaIndex);
                } else {
                    updated.videos = s.videos.filter((_, i) => i !== mediaIndex);
                }
                return updated;
            }));
            return;
        }

        try {
            const token = localStorage.getItem('mib-admin-token');
            const res = await fetch(`${API_BASE_URL}/sponsors/${sponsorId}/media/${mediaItem.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete media');
            }
            // Remove from local state
            setSponsors(prev => prev.map(s => {
                if (s.id !== sponsorId) return s;
                const updated = { ...s };
                if (mediaType === 'image') {
                    updated.images = s.images.filter((_, i) => i !== mediaIndex);
                } else {
                    updated.videos = s.videos.filter((_, i) => i !== mediaIndex);
                }
                return updated;
            }));
        } catch (err) {
            console.error('[SponsorPage] Delete media error:', err);
            alert('Failed to delete media: ' + err.message);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '—';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const GRADIENTS = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    ];

    return (
        <main className="main-content">
            <header className="page-header center-header">
                <div className="header-content">
                    <h1 className="page-title">Sponsors</h1>
                    <p className="page-subtitle">Manage sponsor images and videos for the platform.</p>
                </div>
            </header>

            {/* Add Sponsor Button */}
            {!showAddForm && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="sponsor-add-btn"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '14px 32px',
                            background: 'var(--accent-gradient)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 8px 32px rgba(180, 145, 100, 0.35)',
                            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(180, 145, 100, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(180, 145, 100, 0.35)';
                        }}
                    >
                        <Plus size={20} />
                        Add New Sponsor
                    </button>
                </div>
            )}

            {/* Add Sponsor Form */}
            {showAddForm && (
                <div className="sponsor-form-container animate-fade-in" style={{
                    background: 'var(--bg-card)',
                    borderRadius: '24px',
                    border: '1px solid var(--border-color)',
                    padding: '2rem',
                    marginBottom: '2.5rem',
                    position: 'relative',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                }}>
                    {/* Close Button */}
                    <button
                        onClick={() => {
                            setShowAddForm(false);
                            setSponsorName('');
                            setSelectedImages([]);
                            setSelectedVideos([]);
                            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
                            videoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
                            setImagePreviewUrls([]);
                            setVideoPreviewUrls([]);
                        }}
                        style={{
                            position: 'absolute', top: '16px', right: '16px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
                            color: 'var(--text-muted)', width: '36px', height: '36px',
                            borderRadius: '10px', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; e.currentTarget.style.color = '#f87171'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                        <X size={18} />
                    </button>

                    {/* Form Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '56px', height: '56px', background: 'var(--accent-gradient)',
                            borderRadius: '14px', marginBottom: '1rem',
                            boxShadow: '0 8px 24px rgba(180, 145, 100, 0.3)',
                        }}>
                            <Upload size={28} color="white" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            Add New Sponsor
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Upload sponsor images and videos to showcase on the platform
                        </p>
                    </div>

                    {/* Sponsor Name */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                            Sponsor Name *
                        </label>
                        <input
                            type="text"
                            value={sponsorName}
                            onChange={(e) => setSponsorName(e.target.value)}
                            placeholder="Enter sponsor name..."
                            className="control-input"
                            style={{ width: '100%', fontSize: '1rem', padding: '14px 18px' }}
                        />
                    </div>

                    {/* Upload Zones */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {/* Image Upload Zone */}
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                                <Image size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                Sponsor Images
                            </label>
                            <div
                                className={`sponsor-upload-zone ${dragOver === 'image' ? 'drag-active' : ''}`}
                                onDragOver={(e) => handleDragOver(e, 'image')}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, 'image')}
                                onClick={() => imageInputRef.current?.click()}
                                style={{
                                    border: `2px dashed ${dragOver === 'image' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                    borderRadius: '16px',
                                    padding: '2rem 1rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    background: dragOver === 'image' ? 'rgba(180, 145, 100, 0.08)' : 'rgba(255,255,255,0.02)',
                                    minHeight: '140px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.background = 'rgba(180, 145, 100, 0.05)'; }}
                                onMouseLeave={(e) => { if (dragOver !== 'image') { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}}
                            >
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    background: 'rgba(180, 145, 100, 0.12)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Image size={24} color="#b49164" />
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>
                                    Drop images here or click to browse
                                </p>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                    JPG, PNG, GIF, WebP • Max 10MB each
                                </span>
                            </div>
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                            />

                            {/* Image Previews */}
                            {imagePreviewUrls.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
                                    {imagePreviewUrls.map((url, i) => (
                                        <div key={i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                                            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeSelectedImage(i); }}
                                                style={{
                                                    position: 'absolute', top: '4px', right: '4px',
                                                    background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white',
                                                    width: '22px', height: '22px', borderRadius: '50%',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '10px',
                                                }}
                                            >
                                                <X size={12} />
                                            </button>
                                            <div style={{
                                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                                padding: '4px', fontSize: '0.6rem', color: 'white', textAlign: 'center',
                                            }}>
                                                {formatFileSize(selectedImages[i]?.size || 0)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Video Upload Zone */}
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                                <Film size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                Sponsor Videos
                            </label>
                            <div
                                className={`sponsor-upload-zone ${dragOver === 'video' ? 'drag-active' : ''}`}
                                onDragOver={(e) => handleDragOver(e, 'video')}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, 'video')}
                                onClick={() => videoInputRef.current?.click()}
                                style={{
                                    border: `2px dashed ${dragOver === 'video' ? '#6c5ce7' : 'var(--border-color)'}`,
                                    borderRadius: '16px',
                                    padding: '2rem 1rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    background: dragOver === 'video' ? 'rgba(108, 92, 231, 0.08)' : 'rgba(255,255,255,0.02)',
                                    minHeight: '140px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6c5ce7'; e.currentTarget.style.background = 'rgba(108, 92, 231, 0.05)'; }}
                                onMouseLeave={(e) => { if (dragOver !== 'video') { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}}
                            >
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    background: 'rgba(108, 92, 231, 0.12)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Film size={24} color="#6c5ce7" />
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>
                                    Drop videos here or click to browse
                                </p>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                    MP4, MOV, AVI, WebM • Max 100MB each
                                </span>
                            </div>
                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/*"
                                multiple
                                onChange={handleVideoSelect}
                                style={{ display: 'none' }}
                            />

                            {/* Video Previews */}
                            {videoPreviewUrls.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
                                    {videoPreviewUrls.map((url, i) => (
                                        <div key={i} style={{ position: 'relative', width: '120px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border-color)', background: '#000' }}>
                                            <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeSelectedVideo(i); }}
                                                style={{
                                                    position: 'absolute', top: '4px', right: '4px',
                                                    background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white',
                                                    width: '22px', height: '22px', borderRadius: '50%',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}
                                            >
                                                <X size={12} />
                                            </button>
                                            <div style={{
                                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                                padding: '4px', fontSize: '0.6rem', color: 'white', textAlign: 'center',
                                            }}>
                                                <Film size={10} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                                                {formatFileSize(selectedVideos[i]?.size || 0)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '12px', padding: '1rem', marginBottom: '1rem',
                            background: 'rgba(180, 145, 100, 0.08)', borderRadius: '12px',
                            border: '1px solid rgba(180, 145, 100, 0.2)',
                        }}>
                            <Loader size={18} color="#b49164" style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: '500' }}>
                                {uploadProgress}
                            </span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmitSponsor}
                        disabled={uploading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: uploading ? 'rgba(180, 145, 100, 0.3)' : 'var(--accent-gradient)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: uploading ? 'none' : '0 4px 20px rgba(180, 145, 100, 0.3)',
                        }}
                        onMouseEnter={(e) => { if (!uploading) e.currentTarget.style.boxShadow = '0 8px 30px rgba(180, 145, 100, 0.5)'; }}
                        onMouseLeave={(e) => { if (!uploading) e.currentTarget.style.boxShadow = '0 4px 20px rgba(180, 145, 100, 0.3)'; }}
                    >
                        {uploading ? 'Uploading...' : 'Upload & Save Sponsor'}
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div style={{
                    textAlign: 'center', padding: '5rem 2rem',
                    background: 'var(--bg-card)', borderRadius: '24px',
                    border: '1px solid var(--border-color)',
                }}>
                    <Loader size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading sponsors...</p>
                </div>
            ) : sponsors.length === 0 && !showAddForm ? (
                <div style={{
                    textAlign: 'center',
                    padding: '5rem 2rem',
                    background: 'var(--bg-card)',
                    borderRadius: '24px',
                    border: '1px dashed var(--border-color)',
                }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '20px',
                        background: 'rgba(180, 145, 100, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                    }}>
                        <Image size={36} style={{ opacity: 0.4, color: 'var(--accent-primary)' }} />
                    </div>
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '1.3rem' }}>
                        No Sponsors Yet
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                        Add sponsors with their images and videos to showcase them on the platform.
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                    gap: '1.5rem',
                }}>
                    {sponsors.map((sponsor, sIndex) => {
                        const gradient = GRADIENTS[sIndex % GRADIENTS.length];

                        return (
                            <div
                                key={sponsor.id}
                                className="sponsor-card"
                                style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border-color)',
                                    overflow: 'hidden',
                                    transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                    animation: `fadeInUp 0.5s ease ${sIndex * 0.08}s both`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(180, 145, 100, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(180, 145, 100, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                }}
                            >
                                {/* Card Header */}
                                <div style={{
                                    background: gradient,
                                    padding: '1.5rem',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                                    <div style={{ position: 'absolute', bottom: '-30px', left: '-15px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
                                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: '700', margin: '0 0 6px 0', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                                                {sponsor.name}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(10px)',
                                                    color: 'white', padding: '4px 10px', borderRadius: '20px',
                                                    fontSize: '0.7rem', fontWeight: '600',
                                                }}>
                                                    📸 {sponsor.images.length} Image{sponsor.images.length !== 1 ? 's' : ''}
                                                </span>
                                                <span style={{
                                                    background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(10px)',
                                                    color: 'white', padding: '4px 10px', borderRadius: '20px',
                                                    fontSize: '0.7rem', fontWeight: '600',
                                                }}>
                                                    🎬 {sponsor.videos.length} Video{sponsor.videos.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteSponsor(sponsor.id)}
                                            style={{
                                                background: 'rgba(255,255,255,0.15)', border: 'none',
                                                color: 'white', width: '32px', height: '32px',
                                                borderRadius: '10px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.6)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                                            title="Delete Sponsor"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div style={{ padding: '1.25rem' }}>
                                    {/* Images Gallery */}
                                    {sponsor.images.length > 0 && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(180, 145, 100, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Image size={14} color="#b49164" />
                                                </div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Images</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {sponsor.images.map((img, imgI) => (
                                                    <div key={img.id || imgI} style={{
                                                        position: 'relative', width: '72px', height: '72px',
                                                        borderRadius: '10px', overflow: 'hidden',
                                                        border: '2px solid var(--border-color)',
                                                        cursor: 'pointer', transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'scale(1)'; }}
                                                    >
                                                        <img src={img.url} alt={img.originalName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onClick={() => setPreviewMedia({ type: 'image', url: img.url })} />
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteMedia(sponsor.id, 'image', imgI); }}
                                                            style={{
                                                                position: 'absolute', top: '3px', right: '3px',
                                                                background: 'rgba(0,0,0,0.65)', border: 'none', color: '#f87171',
                                                                width: '20px', height: '20px', borderRadius: '50%',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            }}
                                                        >
                                                            <X size={10} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Videos Gallery */}
                                    {sponsor.videos.length > 0 && (
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(108, 92, 231, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Film size={14} color="#6c5ce7" />
                                                </div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Videos</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {sponsor.videos.map((vid, vidI) => (
                                                    <div key={vid.id || vidI} style={{
                                                        position: 'relative', width: '130px', height: '80px',
                                                        borderRadius: '10px', overflow: 'hidden',
                                                        border: '2px solid var(--border-color)',
                                                        background: '#000', cursor: 'pointer', transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6c5ce7'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'scale(1)'; }}
                                                    onClick={() => setPreviewMedia({ type: 'video', url: vid.url })}
                                                    >
                                                        <video src={vid.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                                        <div style={{
                                                            position: 'absolute', top: '50%', left: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            width: '32px', height: '32px', borderRadius: '50%',
                                                            background: 'rgba(108, 92, 231, 0.85)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}>
                                                            <span style={{ fontSize: '14px', marginLeft: '2px' }}>▶</span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteMedia(sponsor.id, 'video', vidI); }}
                                                            style={{
                                                                position: 'absolute', top: '3px', right: '3px',
                                                                background: 'rgba(0,0,0,0.65)', border: 'none', color: '#f87171',
                                                                width: '20px', height: '20px', borderRadius: '50%',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            }}
                                                        >
                                                            <X size={10} />
                                                        </button>
                                                        <div style={{
                                                            position: 'absolute', bottom: 0, left: 0, right: 0,
                                                            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                                            padding: '4px 6px', fontSize: '0.6rem', color: 'white',
                                                        }}>
                                                            {formatFileSize(vid.size)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* No media state */}
                                    {sponsor.images.length === 0 && sponsor.videos.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            All media has been removed from this sponsor.
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div style={{
                                        marginTop: '1rem', paddingTop: '0.75rem',
                                        borderTop: '1px solid var(--border-color)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }}>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            Added {new Date(sponsor.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Media Preview Modal */}
            {previewMedia && (
                <div
                    className="modal-overlay"
                    style={{ zIndex: 9999, backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.85)' }}
                    onClick={() => setPreviewMedia(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            position: 'relative',
                        }}
                    >
                        <button
                            onClick={() => setPreviewMedia(null)}
                            style={{
                                position: 'absolute', top: '-40px', right: '0',
                                background: 'rgba(255,255,255,0.1)', border: 'none',
                                color: 'white', width: '36px', height: '36px',
                                borderRadius: '50%', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                        >
                            <X size={20} />
                        </button>
                        {previewMedia.type === 'image' ? (
                            <img
                                src={previewMedia.url}
                                alt="Sponsor"
                                style={{
                                    maxWidth: '90vw',
                                    maxHeight: '85vh',
                                    borderRadius: '16px',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                }}
                            />
                        ) : (
                            <video
                                src={previewMedia.url}
                                controls
                                autoPlay
                                style={{
                                    maxWidth: '90vw',
                                    maxHeight: '85vh',
                                    borderRadius: '16px',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
