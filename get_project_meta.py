import frappe
meta = frappe.get_meta("Project")
print("PROJECT FIELDS:", [f.fieldname for f in meta.fields])
