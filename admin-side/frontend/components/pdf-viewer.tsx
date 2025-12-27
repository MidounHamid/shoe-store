"use client"; // Important for client-side rendering in Next.js App Router

import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

type PdfViewerProps = {
    fileUrl: string;
};


const PdfViewer = ({ fileUrl }: PdfViewerProps) => {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    return (
        <div>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
            </Worker>
        </div>
    );
};

export default PdfViewer;