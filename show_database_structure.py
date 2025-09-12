#!/usr/bin/env python
"""
Database Structure Viewer for Alumni System
Run this script to show all table structures for project defense
"""

import sqlite3
import os

def show_database_structure():
    db_path = 'db.sqlite3'
    
    if not os.path.exists(db_path):
        print("Database file not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("=" * 60)
    print("ALUMNI SYSTEM DATABASE STRUCTURE")
    print("=" * 60)
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
    tables = cursor.fetchall()
    
    for table in tables:
        table_name = table[0]
        print(f"\n📋 TABLE: {table_name}")
        print("-" * 50)
        
        # Get table structure
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        
        print(f"{'Column Name':<20} {'Type':<15} {'Not Null':<10} {'Primary Key':<12}")
        print("-" * 60)
        
        for col in columns:
            col_id, name, data_type, not_null, default_val, pk = col
            not_null_str = "YES" if not_null else "NO"
            pk_str = "YES" if pk else "NO"
            print(f"{name:<20} {data_type:<15} {not_null_str:<10} {pk_str:<12}")
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        count = cursor.fetchone()[0]
        print(f"\nTotal Rows: {count}")
    
    conn.close()
    print("\n" + "=" * 60)
    print("DATABASE STRUCTURE COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    show_database_structure()
