import { useEffect, useState,useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { type ColumnDef } from "@tanstack/react-table";
import axiosInstance from "@/lib/axios";
import toast, { Toaster } from "react-hot-toast";
import { useAppTranslation } from "@/i18n/hooks";
import { useSelector } from "react-redux";
import { AccessDenied } from "@/components/common/AccessDenied";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/common/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


// Define the shape of the user data
type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
};

// Define the shape of the form data
type UserFormInputs = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "ADMIN" | "COLLABORATOR";
  firstName?: string;
  lastName?: string;
};

// --- Create User Form Component ---
const CreateUserForm = ({ onUserCreated }: { onUserCreated: () => void }) => {
  const { 
    register, 
    handleSubmit, 
    reset, 
    control,
    watch,
    formState: { errors }
  } = useForm<UserFormInputs>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useAppTranslation(['login']);
  const password = watch("password");

  const onSubmit = async (data: UserFormInputs) => {
    if (data.password !== data.confirmPassword) {
      toast.error(t("passwords_dont_match"));
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(t("creating_user"));
    try {
      const userData = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        first_name: data.firstName,
        last_name: data.lastName
      };

      await axiosInstance.post("/api/users/", userData);
      toast.dismiss(loadingToast);
      toast.success(t("user_created_successfully"));
      reset();
      onUserCreated();
    } catch (error: any) {
      setIsSubmitting(false);
      toast.dismiss(loadingToast);
      if (error.response?.data) {
        // Mostrar errores específicos del backend
        const errorMessages = Object.values(error.response.data).flat();
        errorMessages.forEach((message: unknown) => toast.error(String(message)));
      } else {
        toast.error(t("error_creating_user"));
      }
      console.error("Failed to create user:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">{t("username")}</Label>
          <Input
            id="username"
            {...register("username", {
              required: t("username_required"),
              minLength: {
                value: 3,
                message: t("username_min_length")
              }
            })}
          />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            {...register("email", {
              required: t("email_required"),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t("email_invalid")
              }
            })}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName">{t("first_name")}</Label>
          <Input
            id="firstName"
            {...register("firstName")}
          />
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName">{t("last_name")}</Label>
          <Input
            id="lastName"
            {...register("lastName")}
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            type="password"
            {...register("password", {
              required: t("password_required"),
              minLength: {
                value: 8,
                message: t("password_min_length")
              }
            })}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("confirm_password")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword", {
              required: t("confirm_password_required"),
              validate: value =>
                value === password || t("passwords_dont_match")
            })}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Role */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="role">{t("role")}</Label>
          <Controller
            name="role"
            control={control}
            rules={{ required: t("role_required") }}
            render={({ field, fieldState: { error } }) => (
              <div>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">{t("role_admin")}</SelectItem>
                    <SelectItem value="COLLABORATOR">{t("role_collaborator")}</SelectItem>
                  </SelectContent>
                </Select>
                {error && (
                  <p className="text-sm text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />
      </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            {t("cancel")}
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {t("create_user")}
        </Button>
      </DialogFooter>
    </form>
  );
};


// --- Main Settings Page Component ---

const SettingsPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t, i18n } = useAppTranslation(['login']);
  const currentUser = useSelector((state: any) => state.auth.user);
  const [tableKey, setTableKey] = useState(0); // ← AGREGAR ESTADO

  // DEBUG: Log the user object as seen by this component
  console.log('🔍 SettingsPage - currentUser:', currentUser);
  console.log('✅ i18n CONFIG VERIFICADA:');
  console.log('- defaultNS:', i18n.options.defaultNS);
  console.log('- current language:', i18n.language);
  
  // Verificar headers
  console.log('🔍 HEADERS DEBERÍAN SER:');
  console.log('ID:', t('login:id'));
  console.log('Username:', t('login:username'));
  console.log('Email:', t('login:email'));
  console.log('Role:', t('login:role'));
  console.log('Status:', t('login:status'));


  // Check for role, or fallback to username 'admin'
  const isCurrentUserAdmin = currentUser?.role?.toUpperCase() === 'ADMIN' || currentUser?.username === 'admin';
  console.log('🔍 SettingsPage - isCurrentUserAdmin:', isCurrentUserAdmin);
 useEffect(() => {
    const handleLanguageChange = () => {
      setTableKey(prev => prev + 1); // ← Incrementa la key
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);
  useEffect(() => {
    if (isCurrentUserAdmin) {
      fetchUsers();
    }
  }, [isCurrentUserAdmin]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/api/users/");
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users. Are you logged in as an admin?");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isCurrentUserAdmin) {
    return <AccessDenied />;
  }

  const handleUserCreated = () => {
    setIsDialogOpen(false);
    fetchUsers(); // Refetch users to update the table
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const loadingToast = toast.loading(t("updating_user_status"));
      
      await axiosInstance.patch(
        `/api/users/${userId}/toggle-status/`,
        { is_active: !currentStatus }
      );
      
      toast.dismiss(loadingToast);
      toast.success(t("user_status_updated"));
      fetchUsers(); // Refresh the table
    } catch (error: any) {
      toast.error(t("error_updating_user_status"));
      console.error("Failed to update user status:", error);
    }
  };
  
  // Define the columns for the user table
  const columns = useMemo((): ColumnDef<User>[] => [
  {
    accessorKey: "id",
    header: t("login:id"),
  },
  {
    accessorKey: "username", 
    header: t("login:username"),
  },
  {
    accessorKey: "email",
    header: t("login:email"),
  },
  {
    accessorKey: "role",
    header: t("login:role"),
    cell: ({ row }) => {
      const role = row.getValue("role");
     return role === "ADMIN" ? t("login:role_admin") : t("login:role_collaborator");
    }
  },
  {
    accessorKey: "is_active",
    header: t("login:status"),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      const userId = row.getValue("id");
      
      const isDisabled = userId === currentUser?.id || !isCurrentUserAdmin;

      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={isActive as boolean}
            onCheckedChange={() => handleToggleUserStatus(userId as number, isActive as boolean)}
            disabled={isDisabled}
            aria-label={t("login:toggle_user_status")}
          />
          <span className={isActive ? "text-green-600" : "text-red-600"}>
            {isActive ? t("login:active") : t("login:inactive")}
          </span>
        </div>
      );
    },
  },
], [t, i18n.language, currentUser, isCurrentUserAdmin, handleToggleUserStatus]);
  return (
    <>
      <Toaster position="top-right" />
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>{t("user_management")}</CardTitle>
                <CardDescription>
                  {t("user_management_description")}
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    {t("create_user")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{t("create_new_user")}</DialogTitle>
                    <DialogDescription>
                      {t("create_user_description")}
                    </DialogDescription>
                  </DialogHeader>
                  <CreateUserForm onUserCreated={handleUserCreated} />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <DataTable key={tableKey} columns={columns} data={users} isLoading={isLoading} />
            )}
          </CardContent>
        </Card>
        
        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("total_users")}</CardTitle>
              <CardDescription>{t("active_and_inactive")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("active_users")}</CardTitle>
              <CardDescription>{t("currently_active")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {users.filter(user => user.is_active).length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("inactive_users")}</CardTitle>
              <CardDescription>{t("currently_inactive")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {users.filter(user => !user.is_active).length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;