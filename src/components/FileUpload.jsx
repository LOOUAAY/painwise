import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

const FileUpload = ({ userId, onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', userId);
        formData.append('description', 'Uploaded file');
        formData.append('is_medical_report', false);

        setUploading(true);
        try {
            const response = await fetch('/api/upload_file.php', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                toast.success('File uploaded successfully');
                onUploadSuccess?.(data);
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    }, [userId, onUploadSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxSize: 5 * 1024 * 1024, // 5MB
    });

    return (
        <div
            {...getRootProps()}
            className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
        >
            <input {...getInputProps()} />
            {uploading ? (
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Uploading...</span>
                </div>
            ) : (
                <div>
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                    >
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">
                        {isDragActive
                            ? 'Drop the file here'
                            : 'Drag and drop a file here, or click to select'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        Supported formats: JPG, PNG, PDF, DOC, DOCX (max 5MB)
                    </p>
                </div>
            )}
        </div>
    );
};

export default FileUpload; 