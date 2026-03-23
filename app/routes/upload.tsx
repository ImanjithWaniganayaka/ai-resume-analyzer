import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'object' && err !== null) {
        const e = err as any;
        if (e.message) return String(e.message);
        if (e.error) return typeof e.error === 'string' ? e.error : JSON.stringify(e.error);
        return JSON.stringify(e);
    }
    return String(err) || 'An unknown error occurred.';
}

const Upload = () => {
    const { auth, isLoading, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
        setError(null);
    };

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file: File;
    }) => {
        setIsProcessing(true);
        setError(null);

        try {
            // Step 1: Convert PDF first page to image
            setStatusText('Converting PDF to image...');
            const imageResult = await convertPdfToImage(file);
            if (!imageResult.file) throw new Error('Failed to convert PDF to image. Make sure it is a valid PDF file.');

            // Step 2: Convert image to base64 data URL
            setStatusText('Preparing resume for analysis...');
            const imageDataUrl: string = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(imageResult.file!);
            });

            // Step 3: Send to Puter AI
            setStatusText('Analyzing your resume with AI... (this may take 20–30 seconds)');
            const instructions = prepareInstructions({ jobTitle, jobDescription });

            const response = await (window.puter.ai.chat as any)(
                [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: { url: imageDataUrl },
                            },
                            {
                                type: 'text',
                                text: instructions,
                            },
                        ],
                    },
                ],
                { model: 'gpt-4o' }
            );

            if (!response) throw new Error('AI returned no response. Please try again.');

            // Step 4: Parse AI response
            setStatusText('Processing results...');
            const feedbackText = typeof response.message.content === 'string'
                ? response.message.content
                : response.message.content[0].text;

            let parsedFeedback;
            try {
                const cleaned = feedbackText.replace(/```json[\s\S]*?```|```[\s\S]*?```/g, (m: string) =>
                    m.replace(/```json|```/g, '')
                ).trim();
                parsedFeedback = JSON.parse(cleaned);
            } catch {
                console.error('Raw AI response:', feedbackText);
                throw new Error('AI returned an unexpected format. Please try again.');
            }

            // Step 5: Store results in Puter KV
            setStatusText('Saving results...');
            const uuid = generateUUID();

            const data = {
                id: uuid,
                companyName,
                jobTitle,
                jobDescription,
                imageBase64: imageDataUrl.split(',')[1],
                feedback: parsedFeedback,
            };

            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText('Analysis complete! Redirecting...');
            navigate(`/resume/${uuid}`);

        } catch (err) {
            console.error('Analysis error:', err);
            setError(getErrorMessage(err));
            setStatusText('');
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) {
            setError('Please select a PDF file first.');
            return;
        }

        if (!auth.isAuthenticated) {
            setError('You must be signed into a Puter account first. Click "Sign in now" below.');
            return;
        }

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>

                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}

                    {error && (
                        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-left text-sm">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume (PDF)</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            {!auth.isAuthenticated && !isLoading && (
                                <div className="p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg text-sm">
                                    ⚠️ A free <strong>Puter account</strong> is required to analyze resumes.{' '}
                                    <button type="button" onClick={auth.signIn} className="underline font-semibold">
                                        Sign in now
                                    </button>
                                </div>
                            )}

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;