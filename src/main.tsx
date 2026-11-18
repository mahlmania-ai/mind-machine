import React, {lazy,Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';

const Mind=lazy(()=>import('./App'));
const RoomShell=lazy(()=>import('./rooms/RoomShell'));
const slug=window.location.pathname.split('/').filter(Boolean)[0];
createRoot(document.getElementById('root')!).render(<React.StrictMode><Suspense fallback={<p style={{padding:'2rem'}} role="status">Opening Mahlmania…</p>}>{slug?<RoomShell slug={slug}/>:<Mind/>}</Suspense></React.StrictMode>);
