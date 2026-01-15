import React, { useState, useRef } from 'react';

const FileUpload = ({ onUploadStart, onUploadSuccess, onError, onProgress, city }) => {
    // ... (keep existing state/refs)
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);
    // ...

    // ... (keep handlers)
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
        formData.append('city', city);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                // Process all complete lines
                buffer = lines.pop(); // Keep the last partial line in buffer

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const event = JSON.parse(line);

                        if (event.type === 'progress') {
                            if (onProgress) onProgress(event.message);
                        } else if (event.type === 'complete') {
                            onUploadSuccess(event.data);
                        } else if (event.type === 'error') {
                            throw new Error(event.error);
                        }
                    } catch (e) {
                        console.error("Error parsing stream line:", e);
                    }
                }
            }
        } catch (error) {
            console.error(error);
            onError(error.message || "Failed to analyze file. Please try again.");
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
