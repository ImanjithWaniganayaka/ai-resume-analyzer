import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploaderProps {
    onFileSelect?: (file: File| null) => void
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file: File | null = acceptedFiles?.[0] ?? null;
        setSelectedFile(file);
        onFileSelect?.(file);
    }, [onFileSelect]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        multiple: false,
        accept: { "application/pdf": [".pdf"] },
        maxSize: 20 * 1024 * 1024,
    });

    const formatSize = (bytes: number) => {
        if (!bytes && bytes !== 0) return "";
        const units = ["B", "KB", "MB", "GB"];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(size < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
    };

    return (
        <div className="w-full gradient-border">
            <div {...getRootProps()}>
                <input {...getInputProps()} />

                <div className="space-y-4 cursor-pointer">
                    {selectedFile ? (
                        <div className="Uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                            <img src="/images/pdf.png" alt="pdf" className="size-10" />
                            <div className="flex items-center space-x-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatSize(selectedFile.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="p-2 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFile(null);
                                    onFileSelect?.(null);
                                }}
                            >
                                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="mx-auto flex items-center  h-16 justify-center mb-2">
                                <img src="/icons/info.svg" alt="upload" className="size-20" />
                            </div>
                            <p className="text-lg text-gray-500">
                                <span className="font-semibold">
                                    Click to Upload
                                </span> or drag and drop
                            </p>
                            <p className="text-lg text-gray-500">PDF (max 20 MB)</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
export default FileUploader
