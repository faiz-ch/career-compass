"""
Enhanced Simple BISE Result Scraper
Your existing simple scraper enhanced with CAPTCHA handling from the first code
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import WebDriverException, TimeoutException, NoSuchElementException
import time
import json
import re
import requests
from PIL import Image
import pytesseract
import cv2
import numpy as np

# Configure Tesseract path (uncomment and modify if needed)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def preprocess_captcha_image(image_path):
    """Preprocess the CAPTCHA image for better OCR accuracy"""
    try:
        # Read the image
        img = cv2.imread(image_path)
        if img is None:
            print(f"Could not read image from {image_path}")
            return None
            
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply threshold to make it binary
        _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        
        # Remove noise with morphological operations
        kernel = np.ones((1,1), np.uint8)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
        
        # Resize image to make it larger for better OCR
        height, width = thresh.shape
        thresh = cv2.resize(thresh, (width*3, height*3), interpolation=cv2.INTER_CUBIC)
        
        # Save preprocessed image for debugging
        cv2.imwrite('captcha_preprocessed.png', thresh)
        print("Preprocessed CAPTCHA saved as 'captcha_preprocessed.png'")
        
        return thresh
        
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return None

def extract_captcha_text(driver):
    """Extract text from CAPTCHA image using OCR"""
    try:
        # Get the CAPTCHA image element
        captcha_img = driver.find_element(By.ID, "imgCaptcha")
        
        # Get the image source URL
        img_src = captcha_img.get_attribute('src')
        print(f"CAPTCHA image source: {img_src}")
        
        # If it's a relative URL, make it absolute
        if img_src.startswith('/'):
            img_src = driver.current_url.rstrip('/') + img_src
        
        # Download the image
        cookies = driver.get_cookies()
        session = requests.Session()
        for cookie in cookies:
            session.cookies.set(cookie['name'], cookie['value'])
        
        response = session.get(img_src)
        if response.status_code == 200:
            # Save the original image
            with open('captcha_original.png', 'wb') as f:
                f.write(response.content)
            print("Original CAPTCHA saved as 'captcha_original.png'")
            
            # Preprocess the image
            preprocessed_img = preprocess_captcha_image('captcha_original.png')
            
            if preprocessed_img is not None:
                # Use OCR to extract text from preprocessed image
                custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                captcha_text = pytesseract.image_to_string(preprocessed_img, config=custom_config).strip()
                
                # Also try with original image as backup
                if not captcha_text:
                    print("Trying OCR on original image...")
                    original_img = Image.open('captcha_original.png')
                    captcha_text = pytesseract.image_to_string(original_img, config=custom_config).strip()
                
                # Clean the text
                captcha_text = re.sub(r'[^A-Za-z0-9]', '', captcha_text)
                
                print(f"Extracted CAPTCHA text: '{captcha_text}'")
                return captcha_text
            else:
                print("Failed to preprocess image")
                return None
        else:
            print(f"Failed to download CAPTCHA image. Status code: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Error extracting CAPTCHA text: {e}")
        return None

def handle_captcha_ocr(driver, wait, max_attempts=3):
    """Handle CAPTCHA using OCR with multiple attempts"""
    try:
        # Check if CAPTCHA is present
        captcha_input = wait.until(EC.presence_of_element_located((By.ID, "txtCaptcha")))
        
        print("\n" + "="*50)
        print("CAPTCHA DETECTED - Attempting OCR...")
        print("="*50)
        
        for attempt in range(max_attempts):
            print(f"Attempt {attempt + 1}/{max_attempts}")
            
            # Extract CAPTCHA text using OCR
            captcha_text = extract_captcha_text(driver)
            
            if captcha_text and len(captcha_text) >= 4:  # Assuming CAPTCHA is at least 4 characters
                print(f"OCR extracted text: '{captcha_text}'")
                
                # Enter the CAPTCHA
                captcha_input.clear()
                captcha_input.send_keys(captcha_text)
                print(f"Entered CAPTCHA: {captcha_text}")
                
                # Try submitting and check if it works
                try:
                    view_button = driver.find_element(By.ID, "Button1")
                    view_button.click()
                    print("Submitted form with OCR CAPTCHA")
                    
                    # Wait a bit to see if it processes successfully
                    time.sleep(3)
                    
                    # Check if we got to results page or if there's a CAPTCHA error
                    try:
                        # If we can find the name field, CAPTCHA was successful
                        wait_short = WebDriverWait(driver, 5)
                        wait_short.until(EC.presence_of_element_located((By.ID, "Name")))
                        print("CAPTCHA solved successfully!")
                        return True
                    except TimeoutException:
                        # Check for CAPTCHA error message
                        error_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'captcha') or contains(text(), 'Captcha') or contains(text(), 'Invalid')]")
                        if error_elements:
                            print(f"CAPTCHA attempt {attempt + 1} failed. Error found.")
                            if attempt < max_attempts - 1:
                                # Refresh CAPTCHA for next attempt
                                try:
                                    refresh_button = driver.find_element(By.ID, "btnRefreshCaptcha")
                                    refresh_button.click()
                                    time.sleep(2)
                                    print("CAPTCHA refreshed for next attempt")
                                except:
                                    print("Could not refresh CAPTCHA")
                            continue
                        else:
                            print("CAPTCHA might be correct, but page didn't load as expected")
                            return True
                            
                except Exception as e:
                    print(f"Error submitting form: {e}")
                    if attempt < max_attempts - 1:
                        continue
                    
            else:
                print(f"OCR failed or extracted text too short: '{captcha_text}'")
                if attempt < max_attempts - 1:
                    # Refresh CAPTCHA for next attempt
                    try:
                        refresh_button = driver.find_element(By.ID, "btnRefreshCaptcha")
                        refresh_button.click()
                        time.sleep(2)
                        print("CAPTCHA refreshed for next attempt")
                    except:
                        print("Could not refresh CAPTCHA")
        
        # If all OCR attempts failed, fallback to manual input
        print("All OCR attempts failed. Falling back to manual input...")
        print("Please look at the browser window to see the CAPTCHA image.")
        captcha_text = input("Enter the CAPTCHA text manually: ").strip()
        if captcha_text:
            captcha_input.clear()
            captcha_input.send_keys(captcha_text)
            print(f"Entered CAPTCHA manually: {captcha_text}")
            return True
        
        return False
        
    except TimeoutException:
        print("CAPTCHA input field not found - proceeding without CAPTCHA")
        return True  # No CAPTCHA present, continue normally
    except Exception as e:
        print(f"Error handling CAPTCHA: {e}")
        return False

def fetch_bise_result_data(roll_number: str, exam_type: str, year: str, headless: bool = True):
    """
    Enhanced version of your scraping function with CAPTCHA handling
    
    Args:
        roll_number: Student roll number
        exam_type: '2' for Part-II Annual, '0' for Supplementary, '1' for Part-I Annual
        year: Exam year
        headless: Run browser in headless mode (set to False for CAPTCHA debugging)
    
    Returns:
        Dictionary with student result data
    """
    options = webdriver.ChromeOptions()
    
    if headless:
        options.add_argument("--headless")
    else:
        options.add_argument("--start-maximized")  # For manual CAPTCHA input if needed
    
    # Standard options for better compatibility
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    try:
        print(f"Loading BISE website for Roll: {roll_number}, Type: {exam_type}, Year: {year}")
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
                print(f"Found Intermediate radio button with: {selector_type}")
                break
            except TimeoutException:
                continue
        
        if not intermediate_element:
            raise Exception("Intermediate radio button not found")
        
        # Click the Intermediate radio button
        try:
            driver.execute_script("arguments[0].click();", intermediate_element)
            print("Clicked Intermediate radio button")
        except:
            intermediate_element.click()
            print("Clicked Intermediate radio button (fallback)")
        
        time.sleep(2)
        
        # Enter Roll Number
        print("Entering roll number...")
        roll_input = wait.until(EC.presence_of_element_located((By.ID, "txtFormNo")))
        roll_input.clear()
        roll_input.send_keys(roll_number)
        print(f"Entered roll number: {roll_number}")
        
        # Select Exam Type
        print("Selecting exam type...")
        exam_type_dropdown = wait.until(EC.presence_of_element_located((By.ID, "ddlExamType")))
        Select(exam_type_dropdown).select_by_value(exam_type)
        print(f"Selected exam type: {exam_type}")
        
        # Select Year
        print("Selecting year...")
        year_dropdown = wait.until(EC.presence_of_element_located((By.ID, "ddlExamYear")))
        Select(year_dropdown).select_by_value(year)
        print(f"Selected year: {year}")
        
        # Handle CAPTCHA with OCR (this is the main addition to your code)
        print("Checking for CAPTCHA...")
        captcha_handled = handle_captcha_ocr(driver, wait)
        
        if not captcha_handled:
            print("CAPTCHA handling failed")
            raise Exception("Could not handle CAPTCHA")
        
        # Check if we're already on results page after CAPTCHA handling
        try:
            wait.until(EC.presence_of_element_located((By.ID, "Name")))
            print("Already on results page after CAPTCHA handling")
        except TimeoutException:
            # If not on results page, click View Result button
            print("Clicking View Result button...")
            try:
                view_button = wait.until(EC.element_to_be_clickable((By.ID, "Button1")))
                view_button.click()
                print("Clicked View Result button")
                
                # Wait for result to load
                wait.until(EC.presence_of_element_located((By.ID, "Name")))
                print("Result page loaded successfully")
            except TimeoutException:
                print("Result page did not load")
                raise Exception("Result not found or failed to load")
        
        # Extract student data (your existing logic)
        def get_text(id_):
            try:
                element = driver.find_element(By.ID, id_)
                return element.text.strip() if element.text else "Not Available"
            except NoSuchElementException:
                print(f"Element with ID '{id_}' not found")
                return "Not Available"
        
        print("Extracting student data...")
        student_data = {
            "studentName": get_text("Name"),
            "fatherName": get_text("lblFatherName"),
            "studentCnic": get_text("lblBFARM"),
            "fatherCnic": get_text("lblFatherNIC"),
            "totalMarks": 0,
            "obtainedMarks": 0
        }
        
        # Calculate marks from table (your existing logic)
        try:
            print("Calculating marks from table...")
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
                        
                        print(f"Subject: {cols[0].text}, Total: {total_text}, Obtained: {th1_marks}+{th2_marks}+{pr2_marks}={subject_obtained}")
                        
                    except (ValueError, IndexError) as e:
                        print(f"Error processing table row: {e}")
                        continue
            
            student_data["totalMarks"] = total_marks
            student_data["obtainedMarks"] = obtained_marks
            
            print(f"Calculated Total Marks: {total_marks}")
            print(f"Calculated Obtained Marks: {obtained_marks}")
            
        except Exception as e:
            print(f"Error calculating marks from table: {e}")
            # Fallback method (your existing logic)
            try:
                total_row = driver.find_element(By.XPATH, "//td[contains(text(), 'TOTAL')]/../td[last()]")
                total_info = total_row.text.strip()
                numbers = re.findall(r'\d+', total_info)
                if len(numbers) >= 2:
                    student_data["totalMarks"] = int(numbers[0])
                    student_data["obtainedMarks"] = int(numbers[1])
                    print(f"Fallback extraction - Total: {numbers[0]}, Obtained: {numbers[1]}")
            except Exception as fallback_error:
                print(f"Fallback extraction also failed: {fallback_error}")
        
        print("Data extraction completed successfully")
        return student_data
    
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        # Save screenshot for debugging
        try:
            driver.save_screenshot("debug_error.png")
            print("Error screenshot saved as debug_error.png")
        except:
            pass
        raise
    
    finally:
        driver.quit()

# Example usage - you can use this exactly like your existing function
if __name__ == "__main__":
    try:
        print("Enhanced BISE Result Scraper with CAPTCHA Support")
        print("=" * 50)
        print("Required dependencies:")
        print("- pip install selenium pytesseract pillow opencv-python requests")
        print("- Download and install Tesseract OCR")
        print("=" * 50)
        
        # Test with sample data
        roll_number = input("Enter Roll Number: ").strip()
        exam_type = input("Enter Exam Type (2 for Part-II Annual, 0 for Supplementary, 1 for Part-I Annual): ").strip()
        year = input("Enter Passing Year: ").strip()
        
        print(f"\nFetching result for Roll Number: {roll_number}, Exam Type: {exam_type}, Year: {year}")
        
        # Set headless=False if you want to see the browser for manual CAPTCHA input
        result = fetch_bise_result_data(roll_number=roll_number, exam_type=exam_type, year=year, headless=True)
        
        print("\n" + "="*50)
        print("RESULT:")
        print("="*50)
        print(f"Student Name: {result['studentName']}")
        print(f"Father Name: {result['fatherName']}")
        print(f"Student CNIC: {result['studentCnic']}")
        print(f"Father CNIC: {result['fatherCnic']}")
        print(f"Total Marks: {result['totalMarks']}")
        print(f"Obtained Marks: {result['obtainedMarks']}")
        
        if result['totalMarks'] > 0:
            percentage = (result['obtainedMarks'] / result['totalMarks']) * 100
            print(f"Percentage: {percentage:.2f}%")
            
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.")
    except Exception as e:
        print(f"Failed to fetch result: {str(e)}")
        print("Check the debug screenshots for more information.")