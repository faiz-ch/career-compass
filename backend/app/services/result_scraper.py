from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import WebDriverException, TimeoutException, NoSuchElementException
import time
import json
import re

def fetch_bise_result_data(roll_number: str, exam_type: str, year: str):
    """Modified version of your scraping function - returns JSON data instead of saving to database"""
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # Run in headless mode for production
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    try:
        driver.get("http://result.biselahore.com/")
        wait = WebDriverWait(driver, 30)
        
        time.sleep(5)
        
        # Find and click Intermediate radio button
        intermediate_selectors = [
            (By.ID, "rdlistCourse_1"),
            (By.XPATH, "//input[@type='radio' and @value='HSSC']"),
            (By.XPATH, "//input[@type='radio'][2]"),
            (By.CSS_SELECTOR, "input[type='radio'][value='HSSC']")
        ]
        
        intermediate_element = None
        for selector_type, selector_value in intermediate_selectors:
            try:
                intermediate_element = wait.until(EC.presence_of_element_located((selector_type, selector_value)))
                break
            except TimeoutException:
                continue
        
        if not intermediate_element:
            raise Exception("Intermediate radio button not found")
        
        # Click the Intermediate radio button
        try:
            driver.execute_script("arguments[0].click();", intermediate_element)
        except:
            intermediate_element.click()
        
        time.sleep(2)
        
        # Enter Roll Number
        roll_input = wait.until(EC.presence_of_element_located((By.ID, "txtFormNo")))
        roll_input.clear()
        roll_input.send_keys(roll_number)
        
        # Select Exam Type
        exam_type_dropdown = wait.until(EC.presence_of_element_located((By.ID, "ddlExamType")))
        Select(exam_type_dropdown).select_by_value(exam_type)
        
        # Select Year
        year_dropdown = wait.until(EC.presence_of_element_located((By.ID, "ddlExamYear")))
        Select(year_dropdown).select_by_value(year)
        
        # Click "View Result"
        view_button = wait.until(EC.element_to_be_clickable((By.ID, "Button1")))
        view_button.click()
        
        # Wait for result to load
        try:
            wait.until(EC.presence_of_element_located((By.ID, "Name")))
        except TimeoutException:
            raise Exception("Result not found or failed to load")
        
        # Extract student data
        def get_text(id_):
            try:
                element = driver.find_element(By.ID, id_)
                return element.text.strip() if element.text else "Not Available"
            except NoSuchElementException:
                return "Not Available"
        
        student_data = {
            "studentName": get_text("Name"),
            "fatherName": get_text("lblFatherName"),
            "studentCnic": get_text("lblBFARM"),
            "fatherCnic": get_text("lblFatherNIC"),
            "totalMarks": 0,
            "obtainedMarks": 0
        }
        
        # Calculate marks from table
        try:
            table_rows = driver.find_elements(By.CSS_SELECTOR, "#GridStudentData tr")[2:]
            
            total_marks = 0
            obtained_marks = 0
            
            for row in table_rows:
                cols = row.find_elements(By.TAG_NAME, "td")
                if len(cols) >= 8:
                    if "TOTAL" in cols[0].text.upper():
                        continue
                    
                    try:
                        total_text = cols[3].text.strip()
                        if total_text and total_text != "--":
                            total_marks += int(total_text)
                        
                        th1_text = cols[4].text.strip()
                        th2_text = cols[5].text.strip()
                        pr2_text = cols[6].text.strip()
                        
                        th1_marks = int(th1_text) if th1_text and th1_text != "--" else 0
                        th2_marks = int(th2_text) if th2_text and th2_text != "--" else 0
                        pr2_marks = int(pr2_text) if pr2_text and pr2_text != "--" else 0
                        
                        subject_obtained = th1_marks + th2_marks + pr2_marks
                        obtained_marks += subject_obtained
                        
                    except (ValueError, IndexError):
                        continue
            
            student_data["totalMarks"] = total_marks
            student_data["obtainedMarks"] = obtained_marks
            
        except Exception:
            # Fallback method
            try:
                total_row = driver.find_element(By.XPATH, "//td[contains(text(), 'TOTAL')]/../td[last()]")
                total_info = total_row.text.strip()
                numbers = re.findall(r'\d+', total_info)
                if len(numbers) >= 2:
                    student_data["totalMarks"] = int(numbers[0])
                    student_data["obtainedMarks"] = int(numbers[1])
            except:
                pass
        
        return student_data
    
    finally:
        driver.quit()