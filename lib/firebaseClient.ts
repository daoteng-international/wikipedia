import { db } from '../firebase';
import {
    collection,
    onSnapshot,
    query,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    setDoc
} from 'firebase/firestore';

// --- Generic Helpers ---

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
    const q = query(collection(db, collectionName));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
    });
};

export const addItem = async (collectionName: string, item: any) => {
    const { id, ...data } = item;
    if (id) {
        await setDoc(doc(db, collectionName, id), data);
        return id;
    }
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
};

export const updateItem = async (collectionName: string, id: string, data: any) => {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
};

export const deleteItem = async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
};
