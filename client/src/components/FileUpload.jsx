import React, { useState, useRef } from 'react';

const FileUpload = ({ onUploadStart, onUploadSuccess, onError, city }) => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    const handleFile = async (file) => {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            onError("Invalid file type. Please upload PDF, JPEG, or PNG.");
            return;
        }

        onUploadStart();

        const formData = new FormData();
        formData.append('bill', file);
        formData.append('city', city); // Send selected city

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            onUploadSuccess(data);
        } catch (error) {
            console.error(error);
            onError("Failed to analyze file. Please try again.");
        }
    };

    return (
        <div className="card">
            <form
                className={`upload-zone ${dragActive ? "active" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onSubmit={(e) => e.preventDefault()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="input-file"
                    style={{ display: "none" }}
                    onChange={handleChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                />

                <div className="upload-content">
                    <svg className="icon-upload" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <h3>Drag & Drop your Medical Bill here</h3>
                    <p>Supports PDF, JPEG, PNG</p>
                    <button className="btn" onClick={onButtonClick}>
                        Or Browse Files
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FileUpload;
