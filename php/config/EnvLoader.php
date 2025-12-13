<?php
/**
 * Environment File Loader - MH Couture
 * Fichier: php/config/EnvLoader.php
 * 
 * This class loads environment variables from a .env file
 */

class EnvLoader {
    protected $path;

    public function __construct($path) {
        if (!file_exists($path)) {
            throw new Exception(".env file not found at: $path");
        }
        $this->path = $path;
    }

    public function load() {
        if (!is_readable($this->path)) {
            throw new Exception(".env file is not readable");
        }

        $lines = file($this->path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            // Skip comments
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            // Parse line
            if (strpos($line, '=') !== false) {
                list($name, $value) = explode('=', $line, 2);
                
                $name = trim($name);
                $value = trim($value);

                // Remove quotes if present
                if (preg_match('/^(["\'])(.*)\\1$/', $value, $matches)) {
                    $value = $matches[2];
                }

                // Set environment variable
                if (!array_key_exists($name, $_ENV)) {
                    putenv("$name=$value");
                    $_ENV[$name] = $value;
                    $_SERVER[$name] = $value;
                }
            }
        }
    }

    public static function loadFromDirectory($directory) {
        $path = rtrim($directory, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . '.env';
        $loader = new self($path);
        $loader->load();
    }
}

/**
 * Helper function to get environment variables
 * 
 * @param string $key The environment variable name
 * @param mixed $default Default value if not found
 * @return mixed
 */
function env($key, $default = null) {
    $value = getenv($key);
    
    if ($value === false) {
        $value = isset($_ENV[$key]) ? $_ENV[$key] : $default;
    }

    // Convert string booleans
    if (is_string($value)) {
        switch (strtolower($value)) {
            case 'true':
            case '(true)':
                return true;
            case 'false':
            case '(false)':
                return false;
            case 'empty':
            case '(empty)':
                return '';
            case 'null':
            case '(null)':
                return null;
        }
    }

    return $value;
}
?>