# Project Rules & Architecture Instructions for AI Agents

## Critical Rule: Database Separation (Tool Register vs. Material Issue Register)

The codebase manages **TWO COMPLETELY INDEPENDENT AND UNCONNECTED DATABASES/COLLECTIONS** in Firebase Realtime Database:

### 1. Material Issue Register (`issues/` collection)
- **In-memory cache:** `issuesCache`
- **Purpose:** Daily logging and tracking of materials and consumables issued to workers, supervisors, and vendors. Tracks quantities, return statuses (`Issued`, `Partially Returned`, `Returned`), return logs, and photo receipts.
- **Views:** `dashboard`, `register`, `issue-new`, `return-record`, `edit-issue`, `edit-return`.
- **Target Roles:** `storekeeper`, `viewer`, `admin`.

### 2. Tool Register / Tools Master List (`tools/` collection)
- **In-memory cache:** `toolsCache`
- **Deletion Requests Collection:** `toolDeletionRequests/` (`toolDeletionRequestsCache`)
- **Purpose:** Master catalog and physical tool asset register. Generates serial IDs (`CMM/SMS/[TOOLNAME]/[SEQ]`), tracks total quantities, shelf locations, tool physical conditions (`Available`, `In Maintenance`, `Damaged`, `Lost`), and notes.
- **Views:** `tools-dashboard`, `add-tool`, `edit-tool`.
- **Target Roles:** `tools_admin`, `tools_viewer`, `admin`, and general users with tool status update/deletion request capabilities.

### 📋 Specific Rules for Tool Master List:
1. **Admin-Only Tool Deletion & Deletion Request Workflow:** Once a tool is submitted into the database, it CANNOT be directly deleted by non-admin users. Non-admin users can submit a deletion request with a stated reason (`toolDeletionRequests/`). Only administrators have direct deletion rights and the ability to review, approve, or reject tool deletion requests.
2. **Tool Status History Tracking:** Users can update the status of any registered tool (`Available`, `In Maintenance`, `Damaged`, `Lost`). Every status update is recorded into the `statusHistory` array with a full timestamp, formatted date/time, author name/username, previous status, new status, and optional remarks.
3. **No "In Use" Status:** The tool register does not use or permit an "In Use" status.

---

## 🚫 Inviolable Constraints for AI Agents & Developers:
1. **NO CROSS-DATABASE LINKS:** There is **NO** relationship, foreign key, cross-dependency, or shared ID space between `tools/` and `issues/`.
2. **DO NOT MERGE:** Do **NOT** attempt to merge, join, or cross-reference records from `tools/` with records from `issues/`.
3. **DO NOT CONFLATE:** Do **NOT** treat tool inventory records as material issue/return records.
4. **ISOLATED MODIFICATIONS:** Changes, debugging, or features applied to the Tool Register must not depend on or affect the Material Issue Register, and vice-versa.

