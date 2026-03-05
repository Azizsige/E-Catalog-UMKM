import SellerLayout from "@/Layouts/SellerLayout";
import { Head } from "@inertiajs/react";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import { UserCircle } from "lucide-react";

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <SellerLayout>
            <Head title="Pengaturan Akun" />

            <div className="max-w-4xl pb-10 mx-auto">
                {/* Header Page ala Dashboard Juragan Lapak */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-lg bg-orange-100">
                        <UserCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                            Pengaturan Akun
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Perbarui informasi profil dan kata sandi Anda demi
                            keamanan.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Form Update Profil */}
                    <div className="bg-white p-6 shadow-sm border rounded-xl">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    {/* Form Update Password */}
                    <div className="bg-white p-6 shadow-sm border rounded-xl">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    {/* Note: Komponen <DeleteUserForm /> sengaja DIHAPUS.
                      Sebagai satu-satunya Admin di aplikasi ini, fitur hapus akun
                      sangat berbahaya (bisa bikin web mati/gak bisa diakses lagi).
                    */}
                </div>
            </div>
        </SellerLayout>
    );
}
