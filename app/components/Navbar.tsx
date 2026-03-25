import { Form, NavLink } from "react-router";

interface NavbarProps {
  isAuthenticated: boolean;
}

interface NavItemProps {
  to: string;
  children: React.ReactNode;
}

export function Navbar({ isAuthenticated }: NavbarProps) {
  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <NavLink
            className="text-lg font-semibold tracking-tight text-stone-950"
            to="/"
          >
            DemoDeck
          </NavLink>
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/authors">Authors</NavItem>

          {isAuthenticated ? (
            <>
              <NavItem to="/projects/new">Publish</NavItem>
              <Form action="/" method="post">
                <button
                  className="rounded-full border border-stone-300 px-4 py-2 font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
                  name="_intent"
                  type="submit"
                  value="logout"
                >
                  Logout
                </button>
              </Form>
            </>
          ) : (
            <>
              <NavItem to="/login">Login</NavItem>
              <NavItem to="/register">Register</NavItem>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavItem({ to, children }: NavItemProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        [
          "rounded-full px-4 py-2 font-medium transition",
          isActive
            ? "bg-stone-950 text-white"
            : "border border-stone-300 text-stone-700 hover:border-stone-950 hover:text-stone-950",
        ].join(" ")
      }
      to={to}
    >
      {children}
    </NavLink>
  );
}
