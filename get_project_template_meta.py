import frappe
meta = frappe.get_meta("Project Template")
print("PROJECT TEMPLATE FIELDS:", [f.fieldname for f in meta.fields])
print("PROJECT TEMPLATE TASKS:", [f.fieldname for f in frappe.get_meta("Project Template Task").fields])
