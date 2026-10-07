"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { hostApi } from "@/lib/hostApi";
import toast from "react-hot-toast";

export default function SignupPage() {
  const { user, login } = useUser();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [isPhone, setIsPhone] = useState(true); // Toggle between phone/email
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [shake, setShake] = useState(false);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (user) {
      router.replace("/become-a-host");
    }
  }, [user, router]);

  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  if (user) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    
    setLoading(true);
    try {
      const formattedId = isPhone ? `+91${identifier}` : identifier;
      const res = await hostApi.sendOtp(formattedId);
      toast.success(res.hint, { duration: 5000 });
      setStep(2);
      setTimer(30);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (code: string) => {
    setLoading(true);
    try {
      const formattedId = isPhone ? `+91${identifier}` : identifier;
      const res = await hostApi.verifyOtp(formattedId, code);
      login(res as any);
      toast.success("Welcome!");
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("first name")) {
        // Needs name (new user)
        setStep(3);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        toast.error("Invalid OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    
    if (val && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
    
    if (newOtp.every(x => x) && newOtp.join("").length === 6) {
      verifyCode(newOtp.join(""));
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6).split("");
    const newOtp = [...otp];
    pasted.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    if (pasted.length === 6) {
      otpRefs.current[5]?.focus();
      verifyCode(newOtp.join(""));
    } else {
      otpRefs.current[pasted.length]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) return;
    setLoading(true);
    try {
      const formattedId = isPhone ? `+91${identifier}` : identifier;
      const code = otp.join("");
      const res = await hostApi.verifyOtp(formattedId, code, firstName, lastName);
      login(res as any);
      toast.success("Account created!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-lg border p-8 w-full max-w-md">
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Airbnb</h2>
            
            <div className="border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-black">
              <div className="flex border-b">
                <button 
                  type="button" 
                  className={`flex-1 p-3 text-sm font-medium ${isPhone ? "bg-gray-100" : ""}`}
                  onClick={() => setIsPhone(true)}
                >Phone</button>
                <button 
                  type="button" 
                  className={`flex-1 p-3 text-sm font-medium ${!isPhone ? "bg-gray-100" : ""}`}
                  onClick={() => setIsPhone(false)}
                >Email</button>
              </div>
              <div className="flex items-center p-3">
                {isPhone && <span className="text-gray-500 mr-2">+91</span>}
                <input
                  type={isPhone ? "tel" : "email"}
                  required
                  placeholder={isPhone ? "Phone number" : "Email address"}
                  className="w-full outline-none"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  pattern={isPhone ? "[6-9][0-9]{9}" : undefined}
                />
              </div>
            </div>
            
            <button
              disabled={loading || !identifier}
              type="submit"
              className="w-full bg-[#E51D53] text-white rounded-lg py-3 font-semibold hover:bg-[#D70466] transition disabled:opacity-50"
            >
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <div className={`space-y-6 ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm your number</h2>
              <p className="text-gray-500">Enter the code we sent to {identifier}</p>
            </div>
            
            <div className="flex justify-between gap-2">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  maxLength={1}
                  className="w-12 h-14 border-2 rounded-lg text-center text-xl font-semibold outline-none focus:border-black focus:ring-1 focus:ring-black"
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                />
              ))}
            </div>
            
            <div className="text-sm">
              {timer > 0 ? (
                <p className="text-gray-500">Resend code in {timer}s</p>
              ) : (
                <button onClick={handleSendOtp} className="font-semibold underline">Resend code</button>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleCreateAccount} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Finish signing up</h2>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="First name"
                required
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-black"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last name"
                required
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-black"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-500">Make sure it matches the name on your government ID.</p>
            
            <button
              disabled={loading || !firstName || !lastName}
              type="submit"
              className="w-full bg-[#E51D53] text-white rounded-lg py-3 font-semibold hover:bg-[#D70466] transition disabled:opacity-50"
            >
              Agree and continue
            </button>
          </form>
        )}
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
      `}</style>
    </div>
  );
}
