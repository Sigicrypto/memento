import frappe
print("THE COMPANIES:", frappe.get_all("Company", pluck="name"))
print("THE PROJECTS:", frappe.get_all("Project", pluck="name"))
