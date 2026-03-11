import React from "react"

import { SignIn } from "@clerk/nextjs";

function SignInPage() {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50"> <SignIn /> </div>
}

export default SignInPage;