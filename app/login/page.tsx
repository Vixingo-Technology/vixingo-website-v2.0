"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const email = new URLSearchParams(window.location.search).get("email");
        if (email) {
            setValue("email", email);
        }
    }, [setValue]);

    const onSubmit = async (data: LoginFormData) => {
        setError("");
        const result = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid email or password");
            toast.error("Invalid credentials");
        } else {
            toast.success("Welcome back!");
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/">
                        <span className="font-display text-4xl tracking-wider text-accent-gold">
                            VIXINGO
                        </span>
                    </Link>
                    <p className="text-text-muted text-sm mt-2">
                        Employee Portal
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="bg-bg-secondary border border-bg-border rounded-lg p-8 space-y-5"
                >
                    {error && (
                        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-2 text-sm">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@vixingo.com"
                        {...register("email")}
                        error={errors.email?.message}
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        {...register("password")}
                        error={errors.password?.message}
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isSubmitting}
                        className="w-full"
                    >
                        Sign In &rarr;
                    </Button>

                    <div className="text-center">
                        <Link
                            href="/forgot-password"
                            className="text-sm text-text-muted hover:text-accent-gold transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </form>

                <div className="mt-6 bg-bg-secondary border border-bg-border rounded-lg p-4 text-xs text-text-muted">
                    <p className="font-bold text-text-secondary mb-2">
                        Demo Credentials:
                    </p>
                    <p>Admin: admin@vixingo.com / Admin123!</p>
                    <p>Senior: jordan@vixingo.com / Employee123!</p>
                    <p>Employee: sam@vixingo.com / Employee123!</p>
                </div>
            </div>
        </div>
    );
}
