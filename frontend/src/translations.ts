export const RESOURCES = {
    en: {
        // Navbar
        navHome: "Home",
        navServices: "Services",
        navAbout: "About",
        navContact: "Contact",
        navLogin: "Login",

        // Hero
        heroTitle: "Barangay 174 Health Center",
        heroSubtitle: "Providing quality healthcare services for every resident. Join our community today.",
        heroRegister: "Register Your Account",
        heroLogin: "Access Portal",

        // Auth Common
        welcome: "Welcome Back",
        signInSub: "Sign in to your account",
        createAccount: "Create Account",
        join: "Join BHCare Brgy. 174",

        // Registration Wizard
        scanID: "Scan Your Valid ID",
        scanDesc: "Upload a clear image of your Government ID to automatically fill your details.",
        uploadBtn: "Upload ID Photo",
        processBtn: "Process ID & Continue",
        scanning: "Scanning ID...",
        remove: "Remove & Try Again",
        skip: "Skip ID Scanning & Fill Manually",
        review: "Details scanned from ID. Please review before submitting.",
        detected: "Detected",

        // Form Labels
        firstName: "First Name",
        middleName: "Middle Name",
        lastName: "Last Name",
        dob: "Date of Birth",
        gender: "Gender",
        contact: "Contact Number",
        email: "Email Address",
        region: "Region",
        province: "Province",
        city: "City",
        barangay: "Barangay",
        password: "Password",
        createPw: "Create Password",
        confirmPw: "Confirm Password",

        // Actions
        register: "Sign Up",
        login: "Sign In",
        haveAcc: "Already have an account?",
        noAcc: "Don't have an account?",
        back: "Back",
        submit: "Submit Registration",

        // Gender Options
        selectGender: "Select Gender",
        male: "Male",
        female: "Female",
        other: "Other"
    },
    tl: {
        // Navbar
        navHome: "Tahanan",
        navServices: "Serbisyo",
        navAbout: "Tungkol",
        navContact: "Kontak",
        navLogin: "Mag-login",

        // Hero
        heroTitle: "Barangay 174 Health Center",
        heroSubtitle: "Nagbibigay ng de-kalidad na serbisyong pangkalusugan para sa bawat residente.",
        heroRegister: "Magrehistro",
        heroLogin: "Pumasok sa Portal",

        // Auth Common
        welcome: "Maligayang Pagbabalik",
        signInSub: "Mag-sign in sa iyong account",
        createAccount: "Gumawa ng Account",
        join: "Sumali sa BHCare Brgy. 174",

        // Registration Wizard
        scanID: "I-scan ang Valid ID",
        scanDesc: "Mag-upload ng malinaw na larawan ng iyong Government ID.",
        uploadBtn: "Mag-upload ng ID",
        processBtn: "I-proseso at Magpatuloy",
        scanning: "Nagsusuri...",
        remove: "Tanggalin at Ulitin",
        skip: "Laktawan at Punan Mano-mano",
        review: "Ang mga detalye ay nakuha mula sa ID. Pakisuri.",
        detected: "Natukoy na",

        // Form Labels
        firstName: "Pangalan",
        middleName: "Gitnang Pangalan",
        lastName: "Apelyido",
        dob: "Petsa ng Kapanganakan",
        gender: "Kasarian",
        contact: "Numero ng Telepono",
        email: "Email Address",
        region: "Rehiyon",
        province: "Probinsya",
        city: "Lungsod",
        barangay: "Barangay",
        password: "Password",
        createPw: "Gumawa ng Password",
        confirmPw: "Kumpirmahin ang Password",

        // Actions
        register: "Magrehistro",
        login: "Mag-sign In",
        haveAcc: "May account na?",
        noAcc: "Wala pang account?",
        back: "Bumalik",
        submit: "Isumite",

        // Gender Options
        selectGender: "Piliin ang Kasarian",
        male: "Lalaki",
        female: "Babae",
        other: "Iba pa"
    }
};

export type Language = 'en' | 'tl';
export type TranslationKeys = keyof typeof RESOURCES['en'];
