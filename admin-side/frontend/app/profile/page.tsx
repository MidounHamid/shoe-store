"use client";
import { Layout } from "@/components/layouts/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog"
import { removeTokenSetTime, removeAuthToken, removeExpireIn, getAuthToken } from "@/lib/auth";

import { formatFrenchDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";


const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-base font-medium text-gray-800 dark:text-white">{value}</p>
  </div>
);

export default function Profile() {
  const { user, logout } = useAuth()
  console.log(user)

  // 👉 Add states for password reset
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = getAuthToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to delete account");


      removeAuthToken()
      removeExpireIn()
      removeTokenSetTime()
      window.location.href = "/login";
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Could not delete account",
        variant: "destructive",
      });
    }
  };

  const handlePasswordReset = async () => {
    if (!oldPass || !newPass || newPass !== confirmPass) {
      toast({
        title: "Error",
        description: "Please check your input.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = getAuthToken()

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reset-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: oldPass,
          new_password: newPass,
          new_password_confirmation: confirmPass,
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Failed to reset password");

      toast({ title: "Success", description: "Password updated!" });
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";

      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <DetailItem label="Nom d'utilisateur" value={user?.name ? user.name : ""} />
              <DetailItem label="Email" value={user?.email ? user.email : ""} />
              <DetailItem label="Role" value={user?.role ? user.role.name : ""} />
              <div>
                <p className="text-sm text-gray-500">Vérification Email</p>
                {user?.email_verified_at ? (
                  <div className="flex items-center gap-2">
                    <p className="text-base font-medium text-gray-800 dark:text-white">
                      {formatFrenchDate(user?.email_verified_at)}
                    </p>
                    <Badge variant="secondary" className="text-green-700 bg-green-100 border-green-200">
                      Vérifié
                    </Badge>
                  </div>
                ) : (
                  <Badge variant="destructive">Non vérifié</Badge>
                )}
              </div>
              <div className="w-full h-0.5 my-4 border col-span-2" />
              {user && <DetailItem label="Créé à" value={formatFrenchDate(user?.created_at)} />}
              {user && <DetailItem label="Dernière Modification" value={formatFrenchDate(user?.updated_at)} />}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Old password"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
            <Button onClick={handlePasswordReset}>Reset</Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 flex gap-4">
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Your account will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild onClick={handleDeleteAccount}>
                    <Button variant="destructive">Yes, delete it</Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </CardContent>
        </Card>
      </div>

    </Layout>
  );
}
