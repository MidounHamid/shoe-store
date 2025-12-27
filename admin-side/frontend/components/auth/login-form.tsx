"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/components/ui/use-toast";
import LogoSection from "../logo";

export function LoginForm() {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin@gmail.com");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
    } catch (err) {
      console.error(err);
      setError("Failed to login");
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your credentials and try again",
      });
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Signing in..." />;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="space-y-4 p-6">
        <LogoSection
          width={250}
          height={100}
          className="text-center"
          ImageClassName="mx-auto h-auto w-auto mb-4"
        />
        <p className="text-center text-gray-600">Connectez-vous</p>
      </div>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full mt-5" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loading size="sm" text="Please wait" />
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
