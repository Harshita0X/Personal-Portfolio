import React, { useState, useEffect } from 'react';
import { Camera, Image, Gauge, ArrowRight, XCircle, Loader2, Award, Users, Rocket, Target, Zap, Clock, Eye, EyeOff, Plus, Minus, Download, History, BarChart2, Home, ExternalLink, Sparkle } from 'lucide-react';

// Include html2canvas for the download report feature.
// This library allows us to capture a screenshot of an HTML element.
const HTML_TO_CANVAS_URL = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';

// Load html2canvas dynamically.
const loadHtml2Canvas = () => {
    return new Promise((resolve, reject) => {
        if (window.html2canvas) {
            resolve(window.html2canvas);
            return;
        }
        const script = document.createElement('script');
        script.src = HTML_TO_CANVAS_URL;
        script.onload = () => resolve(window.html2canvas);
        script.onerror = reject;
        document.body.appendChild(script);
    });
};

// Main application component.
export default function App() {
    const [teamName, setTeamName] = useState('SpaceSight Team');
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [detectionResult, setDetectionResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [currentPage, setCurrentPage] = useState('home');
    const [summary, setSummary] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [selectedObjectInfo, setSelectedObjectInfo] = useState(null);

    // This function simulates a backend API call for object detection.
    const handleDetect = async () => {
        if (!selectedImage) {
            console.error('Please select an image first.');
            return;
        }

        setIsLoading(true);
        setDetectionResult(null);
        setSummary('');

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const mockResponse = {
                timestamp: new Date().toISOString(),
                detectedImageUrl: 'https://placehold.co/800x600/18181b/d4d4d8?text=Detected+Objects',
                metrics: {
                    mAP: '78.5%',
                    precision: '85.2%',
                    recall: '82.1%',
                    inferenceSpeed: '45ms'
                },
                detections: [
                    { id: 1, label: 'Fire Extinguisher', confidence: '94%', x: '10%', y: '20%', width: '30%', height: '25%' },
                    { id: 2, label: 'Oxygen Tank', confidence: '88%', x: '55%', y: '40%', width: '20%', height: '40%' },
                    { id: 3, label: 'Toolbox', confidence: '92%', x: '70%', y: '10%', width: '15%', height: '30%' },
                ]
            };
            
            setDetectionResult(mockResponse);
            setHistory(prevHistory => [{ ...mockResponse, previewUrl }, ...prevHistory]);
            setZoomLevel(1);

        } catch (error) {
            console.error('Error simulating detection:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // This function handles the file selection from the input.
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setDetectionResult(null);
            setSummary('');
            setZoomLevel(1);
        }
    };

    // This function resets the UI to its initial state.
    const handleClear = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setDetectionResult(null);
        setSummary('');
        setZoomLevel(1);
        setSelectedObjectInfo(null);
    };

    // This function downloads a report of the current detection results.
    const downloadReport = async () => {
        if (!detectionResult) return;
        
        try {
            const html2canvas = await loadHtml2Canvas();
            const element = document.getElementById('results-panel');
            const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0f172a' });
            const imgData = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = imgData;
            link.download = `SpaceSight_Report_${new Date().toLocaleDateString()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Could not download report', err);
        }
    };
    
    // Function to handle generating an AI summary of the detection results.
    const handleGenerateSummary = async () => {
        if (!detectionResult) return;
        setIsGeneratingSummary(true);

        const prompt = `You are a helpful AI assistant for the SpaceSight object detection system.
        Based on the following detected objects and their confidence scores, provide a concise summary of the findings.
        Detected objects: ${detectionResult.detections.map(d => `${d.label} (${d.confidence})`).join(', ')}.
        Keep the summary to a single paragraph. Focus on the most important detections.`;
        
        try {
            const chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            const generatedText = result.candidates[0].content.parts[0].text;
            setSummary(generatedText);
        } catch (err) {
            console.error('Error generating summary:', err);
            setSummary('Failed to generate summary. Please try again.');
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    // Function to handle fetching AI info for a selected object.
    const handleGetObjectInfo = async (objectLabel) => {
        setSelectedObjectInfo(null);
        
        // Mocking the AI response for demonstration. In a real app, this would be an API call.
        const mockInfo = {
            'Fire Extinguisher': 'A critical safety device for suppressing fires. On a space station, it uses a non-toxic agent to avoid contaminating the atmosphere. Regular checks are essential for crew safety.',
            'Oxygen Tank': 'Provides breathable air for the crew. These tanks are carefully monitored for pressure and leaks. A single tank can sustain life for a specific duration, making them a high-priority asset.',
            'Toolbox': 'Contains essential tools for maintenance and repairs. A well-organized toolbox is crucial for efficient operations. Misplaced tools can pose a serious hazard in a zero-gravity environment.',
        };
        
        setSelectedObjectInfo({ label: objectLabel, info: mockInfo[objectLabel] || 'No information available for this object.' });
    };

    // Card component for features
    const FeatureCard = ({ icon: Icon, title, description, className }) => (
        <div className={`p-6 rounded-xl shadow-lg transition-transform hover:scale-105 ${className}`}>
            <Icon className="w-8 h-8 mb-4 text-white" />
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-200">{description}</p>
        </div>
    );

    // Bounding Box component
    const BoundingBox = ({ detection }) => (
        <div
            className="bounding-box absolute"
            style={{
                top: detection.y,
                left: detection.x,
                width: detection.width,
                height: detection.height,
            }}
        >
            <span className="bounding-box-label">{detection.label} ({detection.confidence})</span>
        </div>
    );

    // Main render function
    return (
        <div className="min-h-screen bg-slate-900 text-gray-100 p-4 md:p-8 flex flex-col items-center font-sans">
            <style>
                {`
                .bounding-box {
                    position: absolute;
                    border: 2px solid #5eead4; /* Cyan border */
                    background-color: rgba(94, 234, 212, 0.2); /* Semi-transparent cyan fill */
                    border-radius: 4px;
                    transition: all 0.3s ease-in-out;
                }
                .bounding-box:hover {
                    box-shadow: 0 0 10px rgba(94, 234, 212, 0.6);
                    transform: scale(1.02);
                }
                .bounding-box-label {
                    position: absolute;
                    top: -20px;
                    left: 0;
                    background-color: #5eead4;
                    color: black;
                    padding: 2px 6px;
                    font-size: 12px;
                    border-radius: 4px;
                    white-space: nowrap;
                    font-weight: bold;
                }
                .horizontal-scroll-menu {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
                .horizontal-scroll-menu::-webkit-scrollbar {
                    height: 8px;
                }
                .horizontal-scroll-menu::-webkit-scrollbar-thumb {
                    background-color: #4a4a4a;
                    border-radius: 4px;
                }
                .horizontal-scroll-menu::-webkit-scrollbar-track {
                    background-color: #2a2a2a;
                }
                .zoomable-image-container {
                    transform-origin: center center;
                    transition: transform 0.3s ease;
                }
                `}
            </style>

            <div className="w-full max-w-6xl z-10 relative">
                {/* Header and Navigation */}
                <header className="w-full flex flex-col md:flex-row justify-between items-center py-4 md:py-6 sticky top-0 z-50 rounded-xl px-6 bg-slate-800 bg-opacity-90 backdrop-blur-sm shadow-xl mb-8">
                    <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
                        <Rocket className="w-8 h-8 text-indigo-400 mr-2" />
                        <h1 className="text-3xl font-extrabold text-white">SpaceSight</h1>
                    </div>
                    <nav className="flex items-center space-x-2 md:space-x-6 text-gray-400">
                        <button
                            onClick={() => setCurrentPage('home')}
                            className={`p-2 rounded-lg transition-all duration-300 ${currentPage === 'home' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50' : 'hover:bg-slate-700 hover:text-white'}`}
                            title="Home"
                        >
                            <Home size={24} />
                        </button>
                        <button
                            onClick={() => setCurrentPage('history')}
                            className={`p-2 rounded-lg transition-all duration-300 ${currentPage === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50' : 'hover:bg-slate-700 hover:text-white'}`}
                            title="History"
                        >
                            <History size={24} />
                        </button>
                        <button
                            onClick={() => setCurrentPage('metrics')}
                            className={`p-2 rounded-lg transition-all duration-300 ${currentPage === 'metrics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50' : 'hover:bg-slate-700 hover:text-white'}`}
                            title="Dashboard"
                        >
                            <BarChart2 size={24} />
                        </button>
                    </nav>
                </header>

                <main className="mt-8 md:mt-12">
                    {/* Home Page Content */}
                    {currentPage === 'home' && (
                        <>
                            {/* Hero Section */}
                            <section className="text-center py-16 md:py-24">
                                <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-white">
                                    Let your ideas take flight
                                </h2>
                                <p className="mt-4 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
                                    Harnessing the power of AI to ensure operational safety in space stations.
                                </p>
                                <p className="mt-2 text-md md:text-lg text-gray-400 max-w-3xl mx-auto italic">
                                    "In space we race with code and grace"
                                </p>
                                <div className="mt-8">
                                    <input
                                        type="text"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        className="text-gray-400 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white text-lg md:text-xl font-bold text-center w-64"
                                    />
                                </div>
                            </section>

                            {/* Features Section */}
                            <section id="features" className="py-12 md:py-20">
                                <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-8 md:mb-12">Key Features</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <FeatureCard icon={Rocket} title="Autonomous Operation" description="Automated detection of critical objects without human intervention." className="bg-indigo-700"/>
                                    <FeatureCard icon={Target} title="High Precision" description="Accurate and reliable identification of objects." className="bg-purple-700"/>
                                    <FeatureCard icon={Clock} title="Real-time Inference" description="Ultra-fast processing speed for time-sensitive tasks." className="bg-cyan-700"/>
                                    <FeatureCard icon={Users} title="Seamless Integration" description="Easy to integrate with existing space station systems." className="bg-fuchsia-700"/>
                                    <FeatureCard icon={Award} title="Robust Performance" description="Maintains high performance under challenging conditions." className="bg-rose-700"/>
                                    <FeatureCard icon={Zap} title="Digital Twin Simulation" description="Trained using high-fidelity synthetic data." className="bg-lime-700"/>
                                </div>
                            </section>
                            
                            {/* Main Application Interface */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                                {/* Input and Controls Column */}
                                <div className="flex flex-col space-y-6">
                                    <div className="bg-slate-800 p-6 rounded-xl border-2 border-dashed border-gray-600 hover:border-indigo-400 transition-colors duration-300">
                                        <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                                            <Image className="w-12 h-12 text-gray-500 mb-2" />
                                            <span className="text-lg text-gray-300 font-medium">
                                                {selectedImage ? selectedImage.name : "Drag & drop an image or click to select"}
                                            </span>
                                            <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    </div>

                                    <div className="flex space-x-4">
                                        <button
                                            onClick={handleDetect}
                                            disabled={!selectedImage || isLoading}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors duration-300 disabled:bg-slate-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="animate-spin" />
                                                    Detecting...
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowRight />
                                                    Run Detection
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleClear}
                                            disabled={isLoading}
                                            className="px-6 py-3 bg-slate-700 text-gray-300 rounded-lg font-semibold shadow-md hover:bg-slate-600 transition-colors duration-300 disabled:bg-slate-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                                        >
                                            <XCircle />
                                        </button>
                                    </div>
                                </div>

                                {/* Results and Metrics Column */}
                                <div id="results-panel" className="bg-slate-800 p-6 rounded-xl flex flex-col items-center relative">
                                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden flex items-center justify-center mb-6 border border-slate-700"
                                        style={{ transform: `scale(${zoomLevel})` }}>
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Uploaded preview"
                                                className="object-contain w-full h-full"
                                            />
                                        ) : (
                                            <div className="text-gray-500 text-center p-4">
                                                <Camera className="w-16 h-16 mx-auto mb-2" />
                                                <p>Select an image to start detection.</p>
                                            </div>
                                        )}
                                        {detectionResult && showBoundingBoxes && detectionResult.detections.map(detection => (
                                            <BoundingBox key={detection.id} detection={detection} />
                                        ))}
                                    </div>

                                    {detectionResult && (
                                        <div className="flex space-x-4 mb-4">
                                            <button onClick={() => setShowBoundingBoxes(!showBoundingBoxes)} className="p-2 rounded-lg bg-slate-700 text-gray-300 hover:bg-slate-600">
                                                {showBoundingBoxes ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                            <button onClick={() => setZoomLevel(Math.min(zoomLevel + 0.1, 2))} className="p-2 rounded-lg bg-slate-700 text-gray-300 hover:bg-slate-600">
                                                <Plus size={20} />
                                            </button>
                                            <button onClick={() => setZoomLevel(Math.max(zoomLevel - 0.1, 0.5))} className="p-2 rounded-lg bg-slate-700 text-gray-300 hover:bg-slate-600">
                                                <Minus size={20} />
                                            </button>
                                            <button onClick={downloadReport} className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                                                <Download size={20} />
                                            </button>
                                        </div>
                                    )}

                                    {detectionResult && (
                                        <div className="w-full">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xl font-bold text-white">Detected Objects</h3>
                                                <button
                                                    onClick={handleGenerateSummary}
                                                    disabled={isGeneratingSummary}
                                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold shadow-md hover:bg-purple-700 transition-colors duration-300 disabled:bg-slate-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                                                >
                                                    {isGeneratingSummary ? (
                                                        <Loader2 className="animate-spin" size={16} />
                                                    ) : (
                                                        <Sparkle size={16} />
                                                    )}
                                                    Summary
                                                </button>
                                            </div>
                                            <ul className="space-y-2">
                                                {detectionResult.detections.map(det => (
                                                    <li
                                                        key={det.id}
                                                        onClick={() => handleGetObjectInfo(det.label)}
                                                        className="flex justify-between items-center bg-slate-700 p-3 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors duration-200"
                                                    >
                                                        <span className="font-semibold text-white">{det.label}</span>
                                                        <span className="text-sm text-gray-400">{det.confidence}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {summary && (
                                                <div className="mt-6 p-4 bg-slate-700 rounded-lg shadow-inner border border-slate-600">
                                                    <h4 className="text-lg font-semibold text-white mb-2">AI Summary</h4>
                                                    <p className="text-sm text-gray-300">{summary}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* History Page Content */}
                    {currentPage === 'history' && (
                        <section className="py-12 md:py-20">
                            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-8">Detection History</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {history.length > 0 ? history.map((item, index) => (
                                    <div key={index} className="p-4 rounded-xl shadow-lg border border-slate-700 bg-slate-800">
                                        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4">
                                            <img src={item.previewUrl} alt={`Detection ${index + 1}`} className="object-cover w-full h-full" />
                                        </div>
                                        <p className="text-sm text-gray-400 mb-2">{new Date(item.timestamp).toLocaleString()}</p>
                                        <h4 className="font-bold text-white">Metrics:</h4>
                                        <ul className="text-sm text-gray-400">
                                            <li>mAP: {item.metrics.mAP}</li>
                                            <li>Precision: {item.metrics.precision}</li>
                                            <li>Recall: {item.metrics.recall}</li>
                                        </ul>
                                    </div>
                                )) : (
                                    <p className="text-center text-gray-400 col-span-3">No detection history yet. Run a detection from the Home page!</p>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Metrics Dashboard Page Content */}
                    {currentPage === 'metrics' && (
                        <section className="py-12 md:py-20">
                            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-8">Model Metrics Dashboard</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="p-6 rounded-xl bg-slate-800">
                                    <h3 className="text-2xl font-bold text-white mb-4">Confusion Matrix</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-center">
                                            <thead>
                                                <tr className="border-b border-gray-600 text-gray-400">
                                                    <th className="p-2"></th>
                                                    <th className="p-2">Fire Extinguisher</th>
                                                    <th className="p-2">Oxygen Tank</th>
                                                    <th className="p-2">Toolbox</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-gray-600">
                                                    <th className="text-left font-bold p-2 text-white">True Fire Extinguisher</th>
                                                    <td className="p-2 text-emerald-400 font-bold">120</td>
                                                    <td className="p-2 text-rose-400">5</td>
                                                    <td className="p-2 text-rose-400">2</td>
                                                </tr>
                                                <tr className="border-b border-gray-600">
                                                    <th className="text-left font-bold p-2 text-white">True Oxygen Tank</th>
                                                    <td className="p-2 text-rose-400">3</td>
                                                    <td className="p-2 text-emerald-400 font-bold">95</td>
                                                    <td className="p-2 text-rose-400">0</td>
                                                </tr>
                                                <tr>
                                                    <th className="text-left font-bold p-2 text-white">True Toolbox</th>
                                                    <td className="p-2 text-rose-400">1</td>
                                                    <td className="p-2 text-rose-400">0</td>
                                                    <td className="p-2 text-emerald-400 font-bold">88</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="p-6 rounded-xl bg-slate-800">
                                    <h3 className="text-2xl font-bold text-white mb-4">mAP Over Time</h3>
                                    <div className="w-full aspect-video bg-slate-700 rounded-lg flex items-center justify-center text-gray-500">
                                        <BarChart2 size={48} />
                                        <p className="ml-4">Chart Placeholder</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </main>

                {/* Object Information Panel */}
                <div className={`fixed inset-y-0 right-0 w-80 bg-slate-900 bg-opacity-95 backdrop-blur-md shadow-xl transition-transform duration-300 p-6 z-50 ${selectedObjectInfo ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Object Details</h3>
                        <button onClick={() => setSelectedObjectInfo(null)} className="p-2 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white">
                            <XCircle size={24} />
                        </button>
                    </div>
                    {selectedObjectInfo && (
                        <div>
                            <h4 className="text-lg font-semibold text-indigo-400 mb-2">{selectedObjectInfo.label}</h4>
                            <p className="text-sm text-gray-300">{selectedObjectInfo.info}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="w-full text-center py-6 text-gray-500 text-sm mt-12">
                    Made with space enthusiasts
                </footer>
            </div>
        </div>
    );
}
