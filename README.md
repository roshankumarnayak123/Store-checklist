# CMM SMS STORE Checklist

Welcome to the **CMM SMS STORE Checklist** application! This is a robust web-based application built to handle the tracking, issuing, and returning of store equipment and tools.

## Features

* **Multi-Role Authentication System:**
  The system uses a flexible multi-role session manager. A single user can hold up to 2 distinct roles simultaneously, granting access to multiple areas of the application without needing separate accounts.
  * **Storekeeper:** Manage the Issue & Return database.
  * **Viewer:** Read-only access to the Issue & Return records.
  * **Tools Admin:** Full control over the Tools Master List (adding, editing, and deleting tools).
  * **Tools Viewer:** Read-only access to the Tools Master List.
  * **Global Admin:** Hardcoded bypass to manage user accounts, assign roles, and oversee all system operations.

* **Issue & Return Tracking:**
  Log when items are issued to personnel and track their status until they are fully or partially returned. Includes real-time KPI widgets for total, pending, and returned tools.

* **Tools Master List:**
  Maintain a centralized database of all tools. The system automatically assigns a unique, auto-incrementing tracking number to every new tool (e.g., `CMM/SMS/Hammer/0001`).

* **Real-time Syncing:**
  Powered by Firebase Realtime Database, ensuring all data across all clients remains in sync instantly.

* **Excel Exporting:**
  Built-in capabilities to generate comprehensive `.xlsx` reports based on date ranges and status filters.

* **Beautiful UI:**
  Features a responsive, modern aesthetic with a smooth dark mode toggle, animated KPI counters, glassmorphism elements, and sleek custom dropdown menus for user management.

## ⚠️ Architecture & Database Separation Rule (For Developers & AI Agents)

**CRITICAL:** The application maintains **TWO COMPLETELY SEPARATE, UNCONNECTED DATABASES/COLLECTIONS**:

1. **Material Issue Register (`issues/` in Firebase RTDB):**
   * **Cache:** `issuesCache`
   * **Scope:** Daily records of consumables and materials issued to supervisors/vendors, tracking partial/full return statuses.
   * **Views:** Dashboard, Register, Issue Material, Return Record.

2. **Tool Register / Tools Master List (`tools/` in Firebase RTDB):**
   * **Cache:** `toolsCache`
   * **Scope:** Physical tool master catalog, unique auto-generated serial numbers (`CMM/SMS/[TOOLNAME]/[SEQ]`), quantities, shelf locations, and tool physical conditions (Available, In Maintenance, Damaged, Lost).
   * **Views:** Tools Master List, Add Tool, Edit Tool.

> **STRICT CONSTRAINT:**
> There is **NO** relationship, foreign key, cross-dependency, or shared ID space between `tools/` and `issues/`. Any AI agent or developer modifying or debugging this code must **NOT** attempt to merge, cross-reference, or join these databases. They must remain completely isolated.

## Setup & Running

This is a client-side web application using Firebase as a backend. 

1. Simply serve the directory locally using a basic HTTP server. For example:
   ```bash
   python -m http.server 8080
   ```
2. Open `http://localhost:8080/index.html` in your web browser.
3. Use the global admin credentials (or your individual storekeeper account) to log in and manage the store.