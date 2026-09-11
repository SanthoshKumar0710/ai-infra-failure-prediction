import { useEffect, useState } from "react";

import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
} from "lucide-react";

import PageLayout from "../components/PageLayout";
import { getMe } from "../api/auth";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getMe()
      .then((data) => {
        if (isMounted) setProfile(data);
      })
      .catch(() => {
        // Keep placeholders below on failure
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = profile?.full_name || "Admin User";
  const displayEmail = profile?.email || "admin@example.com";
  const displayRole = profile?.role || "Administrator";
  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString()
    : "—";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "AU";

  const fields = [
    { icon: User, label: "Full Name", value: displayName },
    { icon: Mail, label: "Email", value: displayEmail },
    { icon: ShieldCheck, label: "Role", value: displayRole },
    { icon: Calendar, label: "Member Since", value: joined },
  ];

  return (
    <PageLayout>

      <div className="page-header">
        <div>
          <div className="page-title-row">
            <User size={25} />
            <h1>Profile</h1>
          </div>

          <p>Your account details on the platform.</p>
        </div>
      </div>

      <div className="glass-panel setting-item" style={{ marginBottom: 16, cursor: "default" }}>
        <div className="avatar" style={{ width: 56, height: 56, fontSize: 18 }}>
          {initials}
        </div>

        <div>
          <strong style={{ display: "block", fontSize: 16 }}>
            {loading ? "Loading..." : displayName}
          </strong>
          <span style={{ color: "#8d92a8", fontSize: 13 }}>
            {displayEmail}
          </span>
        </div>
      </div>

      <div className="settings-list">
        {fields.map(({ icon: Icon, label, value }) => (
          <div className="glass-panel setting-item" key={label} style={{ cursor: "default" }}>
            <div className="setting-icon">
              <Icon size={20} />
            </div>

            <div>
              <strong style={{ display: "block", fontSize: 14 }}>{label}</strong>
              <span style={{ color: "#8d92a8", fontSize: 13 }}>{value}</span>
            </div>
          </div>
        ))}
      </div>

    </PageLayout>
  );
}

export default Profile;
