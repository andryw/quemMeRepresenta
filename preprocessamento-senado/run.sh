python print_date.py 
echo "GETTING THE DATA"
sh get_data.sh dias.txt 
echo "DOWNLOAD FINISH. NOW WILL TRANSFORM THE XML IN CSV"
python parser.py "votacoes/*.xml" "votacoes_senado.csv"
echo "THE END"
