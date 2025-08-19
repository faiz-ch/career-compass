from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import WebDriverException, TimeoutException, NoSuchElementException
import time
import json
import re

class BISELahoreResultScraper:
    def __init__(self, headless=True):
        """Initialize the scraper with Chrome options"""
        self.chrome_options = Options()
        if headless:
            self.chrome_options.add_argument("--headless")
        self.chrome_options.add_argument("--no-sandbox")
        self.chrome_options.add_argument("--disable-dev-shm-usage")
        self.chrome_options.add_argument("--disable-gpu")
        self.chrome_options.add_argument("--window-size=1920,1080")
        
        self.driver = None
        self.base_url = "https://result.biselahore.com/"
    
    def _check_chrome_installation(self):
        """Check if Chrome and ChromeDriver are installed"""
        try:
            # Check if Chrome is installed
            chrome_check = subprocess.run(['google-chrome', '--version'], 
                                        capture_output=True, text=True, timeout=5)
            if chrome_check.returncode != 0:
                return False, "Google Chrome is not installed or not in PATH"
                
            # Check if ChromeDriver is available
            try:
                driver_check = subprocess.run(['chromedriver', '--version'], 
                                            capture_output=True, text=True, timeout=5)
                if driver_check.returncode != 0:
                    return False, "ChromeDriver is not installed or not in PATH"
            except FileNotFoundError:
                return False, "ChromeDriver is not installed or not in PATH"
                
            return True, "Chrome and ChromeDriver are properly installed"
            
        except (subprocess.TimeoutExpired, FileNotFoundError, Exception) as e:
            return False, f"Error checking Chrome installation: {str(e)}"
    
    def start_driver(self):
        """Start the Chrome driver with improved error handling"""
        try:
            # Check Chrome installation first
            is_installed, message = self._check_chrome_installation()
            if not is_installed:
                raise WebDriverException(f"Chrome setup issue: {message}")
            
            # Add more robust Chrome options
            self.chrome_options.add_argument("--disable-extensions")
            self.chrome_options.add_argument("--disable-plugins")
            self.chrome_options.add_argument("--disable-images")
            self.chrome_options.add_argument("--disable-javascript")
            self.chrome_options.add_argument("--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36")
            
            # Try to create driver
            self.driver = webdriver.Chrome(options=self.chrome_options)
            
            # Set timeouts
            self.driver.implicitly_wait(10)
            self.driver.set_page_load_timeout(30)
            
            return self.driver
            
        except WebDriverException as e:
            error_msg = f"WebDriver error: {str(e)}. Please ensure Chrome and ChromeDriver are properly installed."
            raise WebDriverException(error_msg)
        except Exception as e:
            error_msg = f"Unexpected error starting Chrome driver: {str(e)}"
            raise Exception(error_msg)
    
    def close_driver(self):
        """Close the driver"""
        if self.driver:
            self.driver.quit()
    
    def search_result(self, roll_number, exam_type="Part-II (ANNUAL)", year="2024", result_type="Matric"):
        """
        Search for a student's result
        
        Parameters:
        - roll_number: Student's roll number
        - exam_type: "Supplementary", "Part-II (ANNUAL)", "Part-I (ANNUAL)"
        - year: Year (2008-2024)
        - result_type: "Matric" or "Intermediate"
        """
        try:
            if not self.driver:
                self.start_driver()
            
            # Navigate to the result page
            self.driver.get(self.base_url)
            
            # Wait for page to load
            wait = WebDriverWait(self.driver, 10)
            
            # Select result type (Matric/Intermediate)
            result_type_dropdown = wait.until(
                EC.presence_of_element_located((By.NAME, "class"))
            )
            Select(result_type_dropdown).select_by_visible_text(result_type)
            
            # Select year
            year_dropdown = wait.until(
                EC.presence_of_element_located((By.NAME, "year"))
            )
            Select(year_dropdown).select_by_visible_text(year)
            
            # Select exam type
            exam_type_dropdown = wait.until(
                EC.presence_of_element_located((By.NAME, "type"))
            )
            Select(exam_type_dropdown).select_by_visible_text(exam_type)
            
            # Enter roll number
            roll_input = wait.until(
                EC.presence_of_element_located((By.NAME, "roll"))
            )
            roll_input.clear()
            roll_input.send_keys(str(roll_number))
            
            # Click search button
            search_button = wait.until(
                EC.element_to_be_clickable((By.XPATH, "//input[@type='submit']"))
            )
            search_button.click()
            
            # Wait for results to load
            time.sleep(3)
            
            # Extract result data
            result_data = self.extract_result_data()
            
            return {
                "success": True,
                "data": result_data,
                "roll_number": roll_number,
                "exam_type": exam_type,
                "year": year,
                "result_type": result_type
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "roll_number": roll_number
            }
    
    def extract_result_data(self):
        """Extract student result data from the page"""
        try:
            wait = WebDriverWait(self.driver, 10)
            
            # Initialize result dictionary
            result = {}
            
            # Try to find student name
            try:
                name_element = wait.until(
                    EC.presence_of_element_located((By.XPATH, "//td[contains(text(), 'Name')]/following-sibling::td"))
                )
                result['studentName'] = name_element.text.strip()
            except:
                result['studentName'] = ""
            
            # Try to find father's name
            try:
                father_element = self.driver.find_element(By.XPATH, "//td[contains(text(), 'Father')]/following-sibling::td")
                result['fatherName'] = father_element.text.strip()
            except:
                result['fatherName'] = ""
            
            # Try to find roll number
            try:
                roll_element = self.driver.find_element(By.XPATH, "//td[contains(text(), 'Roll')]/following-sibling::td")
                result['rollNumber'] = roll_element.text.strip()
            except:
                result['rollNumber'] = ""
            
            # Try to find board name
            try:
                board_element = self.driver.find_element(By.XPATH, "//td[contains(text(), 'Board')]/following-sibling::td")
                result['board'] = board_element.text.strip()
            except:
                result['board'] = ""
            
            # Try to find year
            try:
                year_element = self.driver.find_element(By.XPATH, "//td[contains(text(), 'Year')]/following-sibling::td")
                result['year'] = year_element.text.strip()
            except:
                result['year'] = ""
            
            # Try to find total marks
            try:
                total_marks_element = self.driver.find_element(By.XPATH, "//td[contains(text(), 'Total')]/following-sibling::td")
                result['totalMarks'] = total_marks_element.text.strip()
            except:
                result['totalMarks'] = ""
            
            # Try to find obtained marks
            try:
                obtained_marks_element = self.driver.find_element(By.XPATH, "//td[contains(text(), 'Obtained')]/following-sibling::td")
                result['obtainedMarks'] = obtained_marks_element.text.strip()
            except:
                result['obtainedMarks'] = ""
            
            # Try to find percentage
            try:
                percentage_element = self.driver.find_element(By.XPATH, "//td[contains(text(), 'Percentage') or contains(text(), '%')]/following-sibling::td")
                result['percentage'] = percentage_element.text.strip()
            except:
                result['percentage'] = ""
            
            # Try to find grade/division
            try:
                grade_element = self.driver.find_element(By.XPATH, "//td[contains(text(), 'Grade') or contains(text(), 'Division')]/following-sibling::td")
                result['grade'] = grade_element.text.strip()
            except:
                result['grade'] = ""
            
            # Extract subjects and marks
            subjects = []
            try:
                subject_rows = self.driver.find_elements(By.XPATH, "//table//tr[td[contains(text(), 'Subject') or contains(@class, 'subject')]]")
                for row in subject_rows:
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if len(cells) >= 3:
                        subject = {
                            'name': cells[0].text.strip(),
                            'totalMarks': cells[1].text.strip() if len(cells) > 1 else "",
                            'obtainedMarks': cells[2].text.strip() if len(cells) > 2 else "",
                            'grade': cells[3].text.strip() if len(cells) > 3 else ""
                        }
                        subjects.append(subject)
            except:
                pass
            
            result['subjects'] = subjects
            
            return result
            
        except Exception as e:
            print(f"Error extracting result data: {str(e)}")
            return {}
    
    def batch_scrape_results(self, roll_numbers, exam_type="Part-II (ANNUAL)", year="2024", result_type="Matric"):
        """Scrape results for multiple roll numbers"""
        results = []
        
        try:
            self.start_driver()
            
            for roll_number in roll_numbers:
                print(f"Scraping result for roll number: {roll_number}")
                result = self.search_result(roll_number, exam_type, year, result_type)
                results.append(result)
                time.sleep(2)  # Add delay between requests
                
        except Exception as e:
            print(f"Error in batch scraping: {str(e)}")
        finally:
            self.close_driver()
        
        return results


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
        driver.get("https://result.biselahore.com/")
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

# Usage example
if __name__ == "__main__":
    scraper = BISELahoreResultScraper(headless=True)  # Set to True for headless mode
    
    # Single result scraping
    result = scraper.search_result("115235", "Part-II (ANNUAL)", "2024", "Matric")
    print(json.dumps(result, indent=2))
    
    scraper.close_driver()
    
    # New function usage
    # result_data = fetch_bise_result_data("115235", "2", "2024")
    # print(json.dumps(result_data, indent=2))
