import { db } from '../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { BRANCHES, EQUIPMENTS, ANNOUNCEMENTS, INITIAL_SPACES, BUSINESS_PARTNERS, INITIAL_OFFICE_TYPES, INITIAL_MEMBERS, INITIAL_VALUE_SERVICES } from '../constants';

export const seedFirestore = async () => {
    console.log('Starting seed...');

    try {
        // Seed branches
        for (const branch of BRANCHES) {
            await setDoc(doc(collection(db, 'branches'), branch.id), branch);
        }

        // Seed wikiItems (Equipments)
        for (const item of EQUIPMENTS) {
            await setDoc(doc(collection(db, 'wikiItems'), item.id), item);
        }

        // Seed announcements
        for (const ann of ANNOUNCEMENTS) {
            await setDoc(doc(collection(db, 'announcements'), ann.id), ann);
        }

        // Seed spaces
        for (const space of INITIAL_SPACES) {
            await setDoc(doc(collection(db, 'spaces'), space.id), space);
        }

        // Seed business partners
        for (const partner of BUSINESS_PARTNERS) {
            await setDoc(doc(collection(db, 'partners'), partner.id), partner);
        }

        // Seed office types
        for (const type of INITIAL_OFFICE_TYPES) {
            await setDoc(doc(collection(db, 'officeTypes'), type.id), type);
        }

        // Seed members
        for (const member of INITIAL_MEMBERS) {
            await setDoc(doc(collection(db, 'members'), member.id), member);
        }

        // Seed value services
        for (const service of INITIAL_VALUE_SERVICES) {
            await setDoc(doc(collection(db, 'valueServices'), service.id), service);
        }

        console.log('Seed completed successfully!');
    } catch (error) {
        console.error('Seed failed:', error);
    }
};

export const seedValueServices = async () => {
    console.log('Seeding Value Services only...');
    try {
        for (const service of INITIAL_VALUE_SERVICES) {
            await setDoc(doc(collection(db, 'valueServices'), service.id), service);
        }
        console.log('Value Services seeded successfully!');
    } catch (error) {
        console.error('Value Services seed failed:', error);
    }
};
