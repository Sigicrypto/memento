import os
import frappe
print(os.listdir('sites'))
frappe.init(site="frontend", sites_path="sites")
frappe.connect()
companies = frappe.get_all("Company", pluck="name")
print("COMPANIES:", companies)
frappe.destroy()
