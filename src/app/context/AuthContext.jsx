"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/app/lib/firebase";

const emailToRole = {
  "admincreatorsmind.co.in@gmail.com": "admin",
  "hodcreatorsmind.co.in@gmail.com": "hod",
  "stocksmanagercreatorsmind201@gmail.com": "stock_manager",
  "dispatchmanager.co.in@gmail.com": "dispatch",
  "installation.co.in@gmail.com": "installation",
  "sales.co.in@gmail.com": "order",
  "ordermanager.co.in@gmail.com": "order",
};

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const email = firebaseUser.email;
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        let role = emailToRole[email] || "user";

        if (userDoc.exists()) {
          const firestoreRole = userDoc.data().role;

          // 🔥 Agar Firestore role mismatch kare to update kar do
          if (firestoreRole !== role) {
            await updateDoc(userDocRef, { role });
            console.log("✅ Role updated in Firestore:", role);
          }
        } else {
          await setDoc(userDocRef, {
            email,
            role,
            name: email.split("@")[0],
            createdAt: new Date().toISOString(),
          });
        }

        console.log("🔥 FINAL ROLE:", role);

        setUser(firebaseUser);
        setUserRole(role);
      } catch (err) {
        console.error("Auth Error:", err);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};