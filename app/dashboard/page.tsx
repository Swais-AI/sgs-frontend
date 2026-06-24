import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logout } from "@/app/actions";
import { isStudentEmailAllowed } from "@/lib/student-access";
import { checkUserRoleInDB } from "@/lib/user-role-check";

type DashboardPageProps = {
  searchParams: Promise<{
    role?: string;
  }>;
};

// Dashboard URL Mapping
const DASHBOARD_URLS: { [key: string]: string } = {
  'admin': 'http://16.112.236.67:3001/admin/students',       // SGS Admin Dashboard
  'principal': 'http://16.112.236.67:3000',                    // Headmaster Dashboard
  'teacher': 'http://16.112.236.67:3002',      // Faculty Dashboard
  'student': 'http://16.112.236.67:84',    // Student Dashboard
  'parent': 'http://16.112.236.67:3009',      // Parent Dashboard
  'guest': 'http://16.112.236.67:3006/guest/dashboard',        // Guest Dashboard
};

function formatRole(role?: string) {
  if (!role) return "Guest";
  const roleMap: { [key: string]: string } = {
    'admin': 'College Admin',
    'principal': 'Principal / Headmaster',
    'teacher': 'Faculty / Teacher',
    'student': 'Student',
    'parent': 'Parent',
    'guest': 'Guest',
  };
  return roleMap[role] || role;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const params = await searchParams;
  const selectedRole = params.role?.toLowerCase();
  const roleLabel = formatRole(params.role);
  const email = session.user?.email ?? "";

  let accessDeniedMessage: string | null = null;

  // ROLE VALIDATION: Check if user exists in database with the selected role
  // As per Sir's instruction: "Don't permit any emails, it should be present in database with that role."
  if (selectedRole && selectedRole !== 'guest') {
    try {
      const roleCheck = await checkUserRoleInDB(email, selectedRole);
      
      if (!roleCheck.allowed) {
        accessDeniedMessage = roleCheck.message || 
          `This email is not registered as a ${roleLabel}. Please contact your administrator.`;
      }
    } catch (error) {
      accessDeniedMessage = "Role validation could not be completed. Please try again.";
    }
  }

  // STUDENT VALIDATION: Additional check for student role (already existing)
  if (selectedRole === "student" && !accessDeniedMessage) {
    try {
      const isAllowed = await isStudentEmailAllowed(email);
      if (!isAllowed) {
        accessDeniedMessage =
          "This Google account is either not registered for student access or the matching record is inactive.";
      }
    } catch {
      accessDeniedMessage =
        "Google sign-in worked, but the student validation check could not be completed.";
    }
  }

  // If access denied, show error page
  if (accessDeniedMessage) {
    return (
      <main className="dashboard-screen">
        <section className="dashboard-card">
          <p className="dashboard-kicker">Access Restricted</p>
          <h1>Access Not Allowed</h1>
          <p className="dashboard-copy">
            Signed in as <strong>{email}</strong> for the <strong>{roleLabel}</strong> role.
          </p>
          <p className="auth-error dashboard-error">{accessDeniedMessage}</p>

          <div className="dashboard-meta">
            <div>
              <span>Role</span>
              <strong>{roleLabel}</strong>
            </div>
            <div>
              <span>Validation</span>
              <strong>Database Check</strong>
            </div>
          </div>

          <form action={logout}>
            <button type="submit" className="signout-button">
              Sign out
            </button>
          </form>
        </section>
      </main>
    );
  }

  // If role is valid, redirect to the respective dashboard
  const dashboardUrl = selectedRole ? DASHBOARD_URLS[selectedRole] : null;

  if (dashboardUrl) {
    redirect(dashboardUrl);
  }

  // Fallback: Show success message if no redirect URL found
  return (
    <main className="dashboard-screen">
      <section className="dashboard-card">
        <p className="dashboard-kicker">Authenticated Successfully</p>
        <h1>Welcome, {session.user?.name ?? "User"}</h1>
        <p className="dashboard-copy">
          You signed in with <strong>{email}</strong> and selected the{" "}
          <strong>{roleLabel}</strong> role.
        </p>

        <div className="dashboard-meta">
          <div>
            <span>Role</span>
            <strong>{roleLabel}</strong>
          </div>
          <div>
            <span>Provider</span>
            <strong>Google OAuth</strong>
          </div>
        </div>

        <p className="text-sm text-yellow-400 mt-4">
          ⚠️ No dashboard URL configured for this role.
        </p>

        <form action={logout}>
          <button type="submit" className="signout-button">
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
