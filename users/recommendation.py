import re
from collections import defaultdict
from .models import User


WORD_MAP = {
    # Programming Languages
    'python': [
        'programming', 'software', 'development', 'coding', 'scripting',
        'automation', 'data', 'ai', 'ml', 'machine learning', 'deep learning',
        'pandas', 'numpy', 'scipy', 'django', 'flask', 'jupyter'
    ],
    'java': [
        'programming', 'software', 'development', 'android', 'oop', 'spring',
        'enterprise', 'backend'
    ],
    'c++': [
        'programming', 'software', 'development', 'systems', 'performance',
        'oop', 'cpp'
    ],
    'c#': [
        'dotnet', 'microsoft', 'backend', 'oop', 'asp.net', 'windows'
    ],
    'javascript': [
        'js', 'web', 'frontend', 'react', 'nodejs', 'vue', 'angular',
        'typescript', 'es6', 'express'
    ],
    'typescript': [
        'javascript', 'js', 'web', 'frontend', 'react', 'angular'
    ],
    'php': [
        'web', 'backend', 'laravel', 'wordpress', 'scripting'
    ],
    'ruby': [
        'web', 'backend', 'rails', 'scripting'
    ],
    'go': [
        'golang', 'systems', 'concurrent', 'backend'
    ],
    'rust': [
        'systems', 'performance', 'memory', 'backend'
    ],
    'swift': [
        'ios', 'apple', 'mobile', 'xcode'
    ],
    'kotlin': [
        'android', 'mobile', 'java', 'jvm'
    ],
    'r': [
        'statistics', 'data', 'analytics', 'data science'
    ],
    'matlab': [
        'mathematics', 'engineering', 'simulation'
    ],
    'scala': [
        'jvm', 'bigdata', 'spark', 'functional'
    ],
    'perl': [
        'scripting', 'automation', 'text processing'
    ],
    'shell': [
        'bash', 'scripting', 'linux', 'automation'
    ],
    'linux': [
        'unix', 'system administration', 'sysadmin', 'infrastructure', 'server',
        'networking', 'security', 'bash', 'shell', 'devops', 'operating system'
    ],
    # Networking & Security
    'networking': [
        'network', 'cisco', 'routing', 'switching', 'tcp/ip', 'dns', 'dhcp',
        'firewall', 'vpn', 'wan', 'lan', 'infrastructure', 'security', 'ccna', 'ccnp'
    ],
    'cisco': [
        'networking', 'routing', 'switching', 'ccna', 'ccnp', 'ccie', 'network',
        'infrastructure', 'tcp/ip', 'firewall', 'security'
    ],
    'security': [
        'cybersecurity', 'network security', 'information security', 'infosec',
        'penetration testing', 'ethical hacking', 'firewall', 'vpn', 'encryption',
        'networking', 'cisco', 'linux', 'system administration'
    ],
    'cybersecurity': [
        'security', 'network security', 'information security', 'infosec',
        'penetration testing', 'ethical hacking', 'firewall', 'vpn', 'encryption'
    ],
    # Web Technologies
    'html': [
        'web', 'frontend', 'markup', 'css', 'html5'
    ],
    'css': [
        'web', 'frontend', 'styling', 'design', 'responsive'
    ],
    'figma': [
        'design', 'ui', 'ux', 'user interface', 'user experience', 'prototyping', 'wireframing'
    ],
    'adobe': [
        'adobe xd', 'design', 'ui', 'ux', 'user interface', 'user experience', 'prototyping', 'wireframing', 'photoshop', 'illustrator'
    ],
    'adobe xd': [
        'design', 'ui', 'ux', 'user interface', 'user experience', 'prototyping', 'wireframing', 'adobexd', 'xd', 'adobe'
    ],
    'xd': [
        'adobe xd', 'design', 'ui', 'ux', 'user interface', 'user experience', 'prototyping', 'wireframing', 'adobe'
    ],
    'sketch': [
        'design', 'ui', 'ux', 'user interface', 'user experience', 'prototyping', 'wireframing'
    ],
    'invision': [
        'design', 'ui', 'ux', 'user interface', 'user experience', 'prototyping', 'wireframing'
    ],
    'react': [
        'javascript', 'js', 'frontend', 'web', 'ui', 'redux', 'hooks'
    ],
    'angular': [
        'javascript', 'typescript', 'frontend', 'web', 'framework'
    ],
    'vue': [
        'javascript', 'frontend', 'web', 'component'
    ],
    'nodejs': [
        'javascript', 'backend', 'server', 'express'
    ],
    'express': [
        'nodejs', 'backend', 'server'
    ],
    'django': [
        'python', 'backend', 'web', 'framework', 'mvc'
    ],
    'flask': [
        'python', 'backend', 'web', 'microframework'
    ],
    'spring': [
        'java', 'backend', 'framework', 'enterprise'
    ],
    'laravel': [
        'php', 'backend', 'framework'
    ],
    'asp.net': [
        'c#', 'dotnet', 'microsoft', 'backend'
    ],
    # Databases
    'mysql': [
        'database', 'sql', 'relational', 'backend', 'rdbms'
    ],
    'postgresql': [
        'database', 'sql', 'relational', 'backend', 'postgres'
    ],
    'mongodb': [
        'database', 'nosql', 'document', 'backend', 'mongo'
    ],
    'redis': [
        'database', 'nosql', 'cache', 'keyvalue'
    ],
    'sqlite': [
        'database', 'sql', 'relational', 'lightweight'
    ],
    'oracle': [
        'database', 'sql', 'enterprise'
    ],
    'sql server': [
        'database', 'sql', 'microsoft'
    ],
    'elasticsearch': [
        'database', 'nosql', 'search', 'elastic'
    ],
    'cassandra': [
        'database', 'nosql', 'distributed', 'apache'
    ],
    # Cloud & DevOps
    'aws': [
        'cloud', 'devops', 'amazon', 'infrastructure', 'deployment',
        'lambda', 's3', 'ec2'
    ],
    'azure': [
        'cloud', 'devops', 'microsoft', 'infrastructure', 'deployment'
    ],
    'gcp': [
        'cloud', 'devops', 'google', 'infrastructure', 'deployment'
    ],
    'docker': [
        'devops', 'container', 'deployment', 'infrastructure'
    ],
    'kubernetes': [
        'devops', 'container', 'orchestration', 'k8s'
    ],
    'jenkins': [
        'devops', 'ci/cd', 'automation', 'pipeline'
    ],
    'git': [
        'version control', 'devops', 'collaboration'
    ],
    'github': [
        'git', 'devops', 'collaboration'
    ],
    'gitlab': [
        'git', 'devops', 'ci/cd'
    ],
    'terraform': [
        'devops', 'infrastructure', 'iac'
    ],
    'ansible': [
        'devops', 'automation', 'configuration'
    ],
    # Data Science & AI
    'ai': [
        'artificial intelligence', 'machine learning', 'ml', 'deep learning',
        'python', 'data science'
    ],
    'machine learning': [
        'ai', 'ml', 'data science', 'analytics', 'algorithm'
    ],
    'ml': [
        'machine learning', 'ai', 'python', 'data science'
    ],
    'deep learning': [
        'ai', 'ml', 'neural networks', 'tensorflow', 'pytorch'
    ],
    'data science': [
        'ai', 'ml', 'python', 'analytics', 'statistics'
    ],
    'tensorflow': [
        'ai', 'ml', 'deep learning', 'python'
    ],
    'pytorch': [
        'ai', 'ml', 'deep learning', 'python'
    ],
    'pandas': [
        'python', 'data analysis', 'dataframe'
    ],
    'numpy': [
        'python', 'numerical', 'computing'
    ],
    'matplotlib': [
        'python', 'data visualization', 'plotting'
    ],
    'seaborn': [
        'python', 'data visualization', 'statistics'
    ],
    'jupyter': [
        'python', 'notebook', 'analysis'
    ],
    # Mobile
    'android': [
        'mobile', 'java', 'kotlin', 'app', 'google'
    ],
    'ios': [
        'mobile', 'swift', 'app', 'apple'
    ],
    'react native': [
        'mobile', 'javascript', 'react'
    ],
    'flutter': [
        'mobile', 'dart', 'google'
    ],
    # Job Titles & Roles
    'software engineer': [
        'programming', 'development', 'engineer', 'developer', 'python',
        'java', 'c#'
    ],
    'software developer': [
        'programming', 'development', 'developer', 'engineer'
    ],
    'full stack developer': [
        'web', 'frontend', 'backend', 'fullstack'
    ],
    'frontend developer': [
        'web', 'frontend', 'ui', 'javascript'
    ],
    'backend developer': [
        'web', 'backend', 'server', 'api'
    ],
    'data scientist': [
        'data science', 'ai', 'ml', 'python'
    ],
    'data engineer': [
        'data science', 'etl', 'pipeline'
    ],
    'devops engineer': [
        'devops', 'infrastructure', 'automation'
    ],
    'product manager': [
        'product', 'management', 'strategy'
    ],
    'project manager': [
        'project', 'management', 'planning'
    ],
    'ui/ux designer': [
        'design', 'user interface', 'user experience'
    ],
    'qa engineer': [
        'testing', 'quality assurance', 'automation'
    ],
    'system administrator': [
        'infrastructure', 'sysadmin'
    ],
    'network engineer': [
        'networking', 'cisco', 'routing', 'switching', 'infrastructure', 'network'
    ],
    'network administrator': [
        'networking', 'cisco', 'infrastructure', 'network', 'system administration'
    ],
    'security engineer': [
        'security', 'cybersecurity', 'network security', 'firewall', 'infosec'
    ],
    'cybersecurity analyst': [
        'security', 'cybersecurity', 'network security', 'information security'
    ],
    'network security engineer': [
        'networking', 'security', 'cybersecurity', 'cisco', 'firewall', 'network'
    ],
    # Companies & Platforms
    'google': [
        'gcp', 'cloud', 'android', 'search'
    ],
    'microsoft': [
        'azure', 'cloud', 'windows', 'office', 'c#', 'dotnet'
    ],
    'amazon': [
        'aws', 'cloud', 'ecommerce'
    ],
    'facebook': [
        'react', 'javascript', 'social'
    ],
    'apple': [
        'ios', 'swift', 'mac', 'mobile'
    ],
    # Soft Skills
    'leadership': [
        'management', 'team', 'direction', 'strategy'
    ],
    'communication': [
        'interpersonal', 'presentation', 'collaboration'
    ],
    'problem solving': [
        'analytical', 'critical thinking', 'solution'
    ],
    'teamwork': [
        'collaboration', 'cooperation', 'group'
    ],
    'time management': [
        'organization', 'planning', 'efficiency'
    ],
    'adaptability': [
        'flexibility', 'change', 'learning'
    ],
    'creativity': [
        'innovation', 'design', 'original'
    ],
    'analytical thinking': [
        'analysis', 'logic', 'reasoning'
    ],
    # Abbreviations & Synonyms
    'api': [
        'application programming interface', 'backend', 'integration'
    ],
    'ui': [
        'user interface', 'frontend', 'design'
    ],
    'ux': [
        'user experience', 'design', 'usability'
    ],
    'ci/cd': [
        'continuous integration', 'continuous deployment', 'devops'
    ],
    'etl': [
        'extract transform load', 'data', 'pipeline'
    ],
    'oop': [
        'object oriented programming', 'design', 'patterns'
    ],
    'mvc': [
        'model view controller', 'architecture'
    ],
    
}

WORD_SIMILARITY = {
    # Programming & Data Science
    ('python', 'ml'): 0.85,
    ('python', 'machine learning'): 0.8,
    ('python', 'data science'): 0.8,
    ('python', 'ai'): 0.8,
    ('python', 'deep learning'): 0.75,
    ('python', 'pandas'): 0.8,
    ('python', 'numpy'): 0.8,
    ('python', 'scipy'): 0.8,
    ('python', 'django'): 0.7,
    ('python', 'flask'): 0.7,
    ('python', 'jupyter'): 0.7,
    ('ml', 'machine learning'): 1.0,
    ('ml', 'deep learning'): 0.9,
    ('ml', 'ai'): 0.85,
    ('ml', 'data science'): 0.8,
    ('ml', 'analytics'): 0.7,
    ('ml', 'algorithm'): 0.7,
    ('machine learning', 'deep learning'): 0.9,
    ('machine learning', 'ai'): 0.85,
    ('machine learning', 'data science'): 0.8,
    ('machine learning', 'analytics'): 0.7,
    ('machine learning', 'algorithm'): 0.7,
    ('deep learning', 'ai'): 0.85,
    ('deep learning', 'data science'): 0.8,
    ('deep learning', 'neural networks'): 1.0,
    ('deep learning', 'tensorflow'): 0.9,
    ('deep learning', 'pytorch'): 0.9,
    ('ai', 'data science'): 0.8,
    ('ai', 'analytics'): 0.7,
    ('ai', 'algorithm'): 0.7,
    ('data science', 'analytics'): 0.8,
    ('data science', 'statistics'): 0.8,
    ('data science', 'data analysis'): 0.8,
    ('data science', 'python'): 0.8,
    ('data science', 'r'): 0.7,
    ('data science', 'jupyter'): 0.7,
    ('data science', 'pandas'): 0.8,
    ('data science', 'numpy'): 0.8,
    ('data science', 'matplotlib'): 0.8,
    ('data science', 'seaborn'): 0.8,
    ('pandas', 'numpy'): 0.8,
    ('pandas', 'data analysis'): 0.9,
    ('numpy', 'data analysis'): 0.8,
    ('matplotlib', 'seaborn'): 0.9,
    ('matplotlib', 'data visualization'): 1.0,
    ('seaborn', 'data visualization'): 1.0,
    ('jupyter', 'notebook'): 1.0,
    ('jupyter', 'python'): 0.7,
    # Programming Languages
    ('java', 'kotlin'): 0.8,
    ('java', 'android'): 0.8,
    ('java', 'spring'): 0.8,
    ('java', 'backend'): 0.7,
    ('c#', 'dotnet'): 0.95,
    ('c#', 'asp.net'): 0.9,
    ('c#', 'windows'): 0.8,
    ('c#', 'backend'): 0.7,
    ('c++', 'cpp'): 1.0,
    ('c++', 'systems'): 0.8,
    ('c++', 'performance'): 0.8,
    ('c++', 'oop'): 0.7,
    ('javascript', 'typescript'): 0.85,
    ('javascript', 'js'): 1.0,
    ('javascript', 'react'): 0.8,
    ('javascript', 'nodejs'): 0.8,
    ('javascript', 'vue'): 0.7,
    ('javascript', 'angular'): 0.7,
    ('typescript', 'react'): 0.8,
    ('typescript', 'angular'): 0.8,
    ('php', 'laravel'): 0.8,
    ('php', 'wordpress'): 0.8,
    ('ruby', 'rails'): 0.9,
    ('go', 'golang'): 1.0,
    ('go', 'backend'): 0.7,
    ('rust', 'systems'): 0.8,
    ('rust', 'performance'): 0.8,
    ('swift', 'ios'): 0.9,
    ('swift', 'apple'): 0.8,
    ('kotlin', 'android'): 0.9,
    ('kotlin', 'java'): 0.8,
    # Web
    ('html', 'css'): 0.9,
    ('html', 'frontend'): 0.8,
    ('css', 'frontend'): 0.8,
    # Design Tools
    ('figma', 'ui'): 0.9,
    ('figma', 'ux'): 0.9,
    ('figma', 'design'): 0.95,
    ('figma', 'user interface'): 0.9,
    ('figma', 'user experience'): 0.9,
    ('figma', 'prototyping'): 0.85,
    ('figma', 'wireframing'): 0.85,
    ('adobe xd', 'xd'): 1.0,
    ('adobe xd', 'figma'): 0.9,
    ('adobe xd', 'ui'): 0.9,
    ('adobe xd', 'ux'): 0.9,
    ('adobe xd', 'design'): 0.95,
    ('adobe xd', 'user interface'): 0.9,
    ('adobe xd', 'user experience'): 0.9,
    ('adobe xd', 'prototyping'): 0.85,
    ('adobe xd', 'wireframing'): 0.85,
    ('xd', 'adobe xd'): 1.0,
    ('xd', 'figma'): 0.9,
    ('xd', 'ui'): 0.9,
    ('xd', 'ux'): 0.9,
    ('xd', 'design'): 0.95,
    ('sketch', 'figma'): 0.9,
    ('sketch', 'ui'): 0.9,
    ('sketch', 'ux'): 0.9,
    ('sketch', 'design'): 0.95,
    ('invision', 'figma'): 0.85,
    ('invision', 'ui'): 0.9,
    ('invision', 'ux'): 0.9,
    ('invision', 'design'): 0.9,
    ('react', 'frontend'): 0.9,
    ('react', 'redux'): 0.8,
    ('react', 'hooks'): 0.8,
    ('react', 'javascript'): 0.8,
    ('nodejs', 'backend'): 0.8,
    ('nodejs', 'express'): 0.9,
    ('express', 'backend'): 0.8,
    ('django', 'python'): 0.8,
    ('django', 'backend'): 0.8,
    ('flask', 'python'): 0.8,
    ('flask', 'backend'): 0.8,
    ('spring', 'java'): 0.8,
    ('spring', 'backend'): 0.8,
    ('laravel', 'php'): 0.8,
    ('laravel', 'backend'): 0.8,
    ('asp.net', 'c#'): 0.9,
    ('asp.net', 'dotnet'): 0.9,
    ('asp.net', 'backend'): 0.8,
    # Databases
    ('mysql', 'sql'): 0.9,
    ('mysql', 'rdbms'): 0.8,
    ('postgresql', 'sql'): 0.9,
    ('postgresql', 'rdbms'): 0.8,
    ('mongodb', 'nosql'): 0.9,
    ('mongodb', 'document'): 0.8,
    ('redis', 'nosql'): 0.8,
    ('redis', 'cache'): 0.9,
    ('sqlite', 'sql'): 0.9,
    ('oracle', 'sql'): 0.9,
    ('sql server', 'sql'): 0.9,
    ('elasticsearch', 'search'): 0.9,
    ('cassandra', 'nosql'): 0.9,
    # Cloud & DevOps
    ('aws', 'cloud'): 0.95,
    ('azure', 'cloud'): 0.95,
    ('gcp', 'cloud'): 0.95,
    ('docker', 'kubernetes'): 0.9,
    ('docker', 'devops'): 0.8,
    ('kubernetes', 'devops'): 0.8,
    ('jenkins', 'ci/cd'): 0.9,
    ('jenkins', 'devops'): 0.8,
    ('git', 'github'): 0.9,
    ('git', 'gitlab'): 0.9,
    ('terraform', 'iac'): 0.9,
    ('ansible', 'automation'): 0.9,
    # Mobile
    ('android', 'mobile'): 0.95,
    ('ios', 'mobile'): 0.95,
    ('react native', 'mobile'): 0.9,
    ('flutter', 'mobile'): 0.9,
    # Job Titles & Roles
    ('software engineer', 'software developer'): 0.95,
    ('software engineer', 'developer'): 0.9,
    ('software engineer', 'engineer'): 0.9,
    ('full stack developer', 'backend developer'): 0.8,
    ('full stack developer', 'frontend developer'): 0.8,
    ('frontend developer', 'ui'): 0.8,
    ('backend developer', 'api'): 0.8,
    ('data scientist', 'data engineer'): 0.8,
    ('data scientist', 'analyst'): 0.7,
    ('devops engineer', 'devops'): 0.95,
    ('product manager', 'project manager'): 0.8,
    ('ui/ux designer', 'designer'): 0.9,
    ('qa engineer', 'testing'): 0.9,
    ('system administrator', 'sysadmin'): 0.95,
    # Networking & Security
    ('networking', 'cisco'): 0.9,
    ('networking', 'network'): 0.95,
    ('networking', 'routing'): 0.85,
    ('networking', 'switching'): 0.85,
    ('networking', 'security'): 0.8,
    ('networking', 'infrastructure'): 0.8,
    ('cisco', 'ccna'): 0.95,
    ('cisco', 'ccnp'): 0.9,
    ('cisco', 'routing'): 0.9,
    ('cisco', 'switching'): 0.9,
    ('cisco', 'networking'): 0.9,
    ('cisco', 'network'): 0.9,
    ('security', 'cybersecurity'): 0.95,
    ('security', 'network security'): 0.9,
    ('security', 'information security'): 0.9,
    ('security', 'infosec'): 0.95,
    ('security', 'firewall'): 0.85,
    ('security', 'vpn'): 0.8,
    ('security', 'networking'): 0.8,
    ('security', 'linux'): 0.75,
    ('cybersecurity', 'penetration testing'): 0.85,
    ('cybersecurity', 'ethical hacking'): 0.85,
    ('linux', 'unix'): 0.9,
    ('linux', 'system administration'): 0.85,
    ('linux', 'sysadmin'): 0.85,
    ('linux', 'infrastructure'): 0.8,
    ('linux', 'server'): 0.8,
    ('linux', 'networking'): 0.75,
    ('linux', 'security'): 0.75,
    ('linux', 'shell'): 0.8,
    ('linux', 'bash'): 0.8,
    ('network engineer', 'network administrator'): 0.9,
    ('network engineer', 'networking'): 0.95,
    ('network engineer', 'cisco'): 0.85,
    ('network administrator', 'networking'): 0.9,
    ('network administrator', 'system administrator'): 0.8,
    ('security engineer', 'cybersecurity analyst'): 0.9,
    ('security engineer', 'security'): 0.95,
    ('security engineer', 'cybersecurity'): 0.9,
    ('cybersecurity analyst', 'security'): 0.95,
    ('cybersecurity analyst', 'cybersecurity'): 0.95,
    ('network security engineer', 'network engineer'): 0.85,
    ('network security engineer', 'security engineer'): 0.85,
    ('network security engineer', 'networking'): 0.9,
    ('network security engineer', 'security'): 0.9,
    # Companies & Platforms
    ('google', 'gcp'): 0.9,
    ('google', 'android'): 0.8,
    ('microsoft', 'azure'): 0.9,
    ('microsoft', 'windows'): 0.8,
    ('amazon', 'aws'): 0.9,
    ('facebook', 'react'): 0.8,
    ('apple', 'ios'): 0.8,
    # Soft Skills
    ('leadership', 'management'): 0.9,
    ('communication', 'collaboration'): 0.8,
    ('problem solving', 'analytical'): 0.8,
    ('teamwork', 'collaboration'): 0.9,
    ('time management', 'organization'): 0.8,
    ('adaptability', 'flexibility'): 0.8,
    ('creativity', 'innovation'): 0.8,
    ('analytical thinking', 'analysis'): 0.9,
    # Abbreviations & Synonyms
    ('api', 'application programming interface'): 1.0,
    ('ui', 'user interface'): 1.0,
    ('ux', 'user experience'): 1.0,
    ('ci/cd', 'continuous integration'): 0.9,
    ('ci/cd', 'continuous deployment'): 0.9,
    ('etl', 'extract transform load'): 1.0,
    ('oop', 'object oriented programming'): 1.0,
    ('mvc', 'model view controller'): 1.0,
}

FIELD_WEIGHTS = {
    'skills': 4,
    'job_title': 3,
    'company': 1,
    'bio': 1,
}

def extract_ngrams(words, n=2):
    return [' '.join(words[i:i+n]) for i in range(len(words)-n+1)]

def tokenize(text):
    if not text:
        return []
    text = re.sub(r'[^\w\s]', ' ', str(text).lower())
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
        'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
        'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'his', 'hers', 'ours', 'theirs'
    }
    words = [w.strip() for w in text.split() if w.strip() and len(w) > 2 and w not in stop_words]
    return words

def expand_words(words):
    expanded = set(words)
    # Create n-grams from the words to handle multi-word skills
    all_phrases = list(words)
    if len(words) > 1:
        # Add bigrams
        for i in range(len(words) - 1):
            bigram = f"{words[i]} {words[i+1]}"
            all_phrases.append(bigram)
    
    # Expand individual words and phrases
    for phrase in all_phrases:
        if phrase in WORD_MAP:
            expanded.update(WORD_MAP[phrase])
        for key, values in WORD_MAP.items():
            # Check if phrase matches key or is a substring
            if phrase == key or phrase in key or key in phrase:
                expanded.update(values)
    return list(expanded)

def build_vocab(profiles, ngram_n=2):
    vocab = set()
    for profile in profiles:
        for field in FIELD_WEIGHTS:
            text = getattr(profile, field, '') or ''
            words = expand_words(tokenize(text))
            ngrams = extract_ngrams(words, n=ngram_n)
            vocab.update(words)
            vocab.update(ngrams)
    return sorted(vocab)

def profile_to_vector(profile, vocab, ngram_n=2):
    word_count = defaultdict(int)
    for field, weight in FIELD_WEIGHTS.items():
        text = getattr(profile, field, '') or ''
        words = expand_words(tokenize(text))
        ngrams = extract_ngrams(words, n=ngram_n)
        for w in words + ngrams:
            word_count[w] += weight
    return [word_count[v] for v in vocab]

def cosine_similarity_with_semantic_enhancement(vec1, vec2, vocab):
    """
    Enhanced Cosine Similarity Algorithm
    
    Base Formula: cos(θ) = A·B / (||A|| × ||B||)
    
    Enhancement: Adds semantic similarity scores between related terms
    to improve matching beyond basic cosine similarity.
    
    Args:
        vec1, vec2: Profile vectors
        vocab: Vocabulary list for semantic lookup
    
    Returns:
        Enhanced cosine similarity score (0.0 to 1.0)
    """
    # Standard cosine similarity: dot product
    dot = sum(a*b for a, b in zip(vec1, vec2))
    
    # Semantic enhancement: add similarity scores for related terms
    for i, v1 in enumerate(vocab):
        for j, v2 in enumerate(vocab):
            if i != j and vec1[i] > 0 and vec2[j] > 0:
                sim = WORD_SIMILARITY.get((v1, v2), WORD_SIMILARITY.get((v2, v1), 0))
                dot += sim * vec1[i] * vec2[j]
    
    # L2 normalization (standard cosine similarity)
    norm1 = sum(a*a for a in vec1) ** 0.5
    norm2 = sum(b*b for b in vec2) ** 0.5
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

def recommend_alumni_enhanced_cosine(student_profile, alumni_profiles, k=5, ngram_n=2):
    """
    Alumni Recommendation using Enhanced Cosine Similarity
    
    Algorithm Steps:
    1. Build vocabulary from all profiles with n-gram expansion
    2. Convert profiles to weighted vectors (skills=4x, job_title=3x, etc.)
    3. Calculate enhanced cosine similarity with semantic understanding
    4. Return top-k most similar alumni
    
    Args:
        student_profile: Student user profile
        alumni_profiles: List of alumni profiles
        k: Number of recommendations to return
        ngram_n: N-gram size for context (default: 2)
    
    Returns:
        List of top-k recommended alumni profiles
    """
    if not alumni_profiles:
        return []
    
    alumni_list = list(alumni_profiles)
    all_profiles = [student_profile] + alumni_list
    
    # Build vocabulary with word expansion and n-grams
    vocab = build_vocab(all_profiles, ngram_n=ngram_n)
    
    # Convert profiles to vectors
    student_vec = profile_to_vector(student_profile, vocab, ngram_n=ngram_n)
    alumni_vecs = [profile_to_vector(a, vocab, ngram_n=ngram_n) for a in alumni_list]
    
    # Calculate enhanced cosine similarity for each alumni
    similarities = [(i, cosine_similarity_with_semantic_enhancement(student_vec, vec, vocab)) for i, vec in enumerate(alumni_vecs)]
    
    # Sort by similarity score (descending)
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    # Return top-k recommendations
    top_k = [alumni_list[i] for i, sim in similarities[:k]]
    return top_k

