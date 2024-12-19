import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import {
    addDoc,
    collection,
    onSnapshot
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Slides(){
    return (
        <>
            <div className='grid-child'>
                <p>Blabla</p>
                {/* <div dangerouslySetInnerHTML={{ __html: doc.docsDesc }} /> */}
            </div>
        </>
    )
}