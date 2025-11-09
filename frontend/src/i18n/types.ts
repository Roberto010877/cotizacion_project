export interface TranslationResources {
  common: {
    app_title: string;
    app_description: string;
    navigation: string;
    logout: string;
    page_content: string;
    status: string;
    active: string;
    inactive: string;
    no_results: string;
    access_denied_title: string;
    access_denied_description: string;
    access_denied_contact: string;
    return_to_dashboard: string;
    go_back: string;
    username: string;
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
    role: string;
    select_role: string;
    role_admin: string;
    role_collaborator: string;
    cancel: string;
    creating_user: string;
    user_created_successfully: string;
    error_creating_user: string;
    username_required: string;
    username_min_length: string;
    email_required: string;
    email_invalid: string;
    password_required: string;
    password_min_length: string;
    confirm_password_required: string;
    passwords_dont_match: string;
    role_required: string;
  };
  login: Record<string, string>;  // Temporalmente usando Record hasta que definamos las claves específicas
  dashboard: Record<string, string>;  // Temporalmente usando Record hasta que definamos las claves específicas
}

export type TranslationKey<NS extends keyof TranslationResources> = keyof TranslationResources[NS];