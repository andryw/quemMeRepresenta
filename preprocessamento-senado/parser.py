# coding: utf-8
import sys
from xml.dom import minidom
import glob

###################################
#
#To run:
#python parser.py folder/*.xml file_to_write.csv
#
###################################

reload(sys)
sys.setdefaultencoding('utf8')

files = glob.glob(sys.argv[1])
fileToWrite = open(sys.argv[2],'w')

header =  'codigo_sessao\tsigla_casa\tcodigo_sessao_legislativa\ttipo_sessao\tnum_sessao\tdata_sessao\thora_inicio\tcodigo_tramitacao\tcodigo_sessao_votacao\tsequecial_sessao\tsecreta\tdescricao_votacao\tresultado\tcodigo_materia\tsigla_materia\tnumero_materia\tano_materia\tsigla_casa2\tcodigo_parlamentar\tnome_parlamentar\tsexo_parlamentar\tsigla_partido\tsigla_uf\turl\tfoto\ttratamento\tvoto_senador'
fileToWrite.write(header + '\n')

for file in files:

    try:
        xmldoc = minidom.parse(file)
    except:
        txt = open(file)
        if ("xml") not in txt.readline():
            print "ERROR: NOT A XML >>> " + file
            continue
        else:
            print "ERROR: >>>" + file
            continue
            
    for votacoes in xmldoc.getElementsByTagName('Votacoes'):
        for votacao in votacoes.getElementsByTagName('Votacao'):
            to_print = []

            codigo_sessao = votacao.getElementsByTagName('CodigoSessao')[0].firstChild.nodeValue
            sigla_casa = votacao.getElementsByTagName('SiglaCasa')[0].firstChild.nodeValue
            codigo_sessao_legislativa = votacao.getElementsByTagName('CodigoSessaoLegislativa')[0].firstChild.nodeValue
            tipo_sessao = votacao.getElementsByTagName('TipoSessao')[0].firstChild.nodeValue
            num_sessao = votacao.getElementsByTagName('NumeroSessao')[0].firstChild.nodeValue
            data_sessao = votacao.getElementsByTagName('DataSessao')[0].firstChild.nodeValue
            hora_inicio = votacao.getElementsByTagName('HoraInicio')[0].firstChild.nodeValue
            codigo_tramitacao = votacao.getElementsByTagName('CodigoTramitacao')[0].firstChild.nodeValue
            codigo_sessao_votacao = votacao.getElementsByTagName('CodigoSessaoVotacao')[0].firstChild.nodeValue
            sequecial_sessao = votacao.getElementsByTagName('SequencialSessao')[0].firstChild.nodeValue
            secreta = votacao.getElementsByTagName('Secreta')[0].firstChild.nodeValue

            try:
                resultado = votacao.getElementsByTagName('Resultado')[0].firstChild.nodeValue
            except:
                resultado = "NULL"

            descricao_votacao = votacao.getElementsByTagName('DescricaoVotacao')[0].firstChild.nodeValue
            codigo_materia = votacao.getElementsByTagName('CodigoMateria')[0].firstChild.nodeValue
            sigla_materia = votacao.getElementsByTagName('SiglaMateria')[0].firstChild.nodeValue
            numero_materia = votacao.getElementsByTagName('NumeroMateria')[0].firstChild.nodeValue
            ano_materia = votacao.getElementsByTagName('AnoMateria')[0].firstChild.nodeValue
            sigla_casa2 = votacao.getElementsByTagName('SiglaCasa')[1].firstChild.nodeValue

            to_print.append(codigo_sessao)
            to_print.append(sigla_casa)
            to_print.append(codigo_sessao_legislativa)
            to_print.append(tipo_sessao)
            to_print.append(num_sessao)
            to_print.append(data_sessao)
            to_print.append(hora_inicio)
            to_print.append(codigo_tramitacao)
            to_print.append(codigo_sessao_votacao)
            to_print.append(sequecial_sessao)
            to_print.append(secreta)

            to_print.append(descricao_votacao)
            to_print.append(resultado)
            to_print.append(codigo_materia)
            to_print.append(sigla_materia)
            to_print.append(numero_materia)
            to_print.append(ano_materia)
            to_print.append(sigla_casa2)

            for votoParlamentar in votacao.getElementsByTagName('Votos'):
                for voto in votoParlamentar.getElementsByTagName('VotoParlamentar'):
                    to_print_senador = []

                    codigo_parlamentar = voto.getElementsByTagName('CodigoParlamentar')[0].firstChild.nodeValue
                    nome_parlamentar = voto.getElementsByTagName('NomeParlamentar')[0].firstChild.nodeValue
                    sexo_parlamentar = voto.getElementsByTagName('SexoParlamentar')[0].firstChild.nodeValue
                    sigla_partido = voto.getElementsByTagName('SiglaPartido')[0].firstChild.nodeValue
                    sigla_uf = voto.getElementsByTagName('SiglaUF')[0].firstChild.nodeValue
                    url = voto.getElementsByTagName('Url')[0].firstChild.nodeValue
                    foto = voto.getElementsByTagName('Foto')[0].firstChild.nodeValue
                    tratamento = voto.getElementsByTagName('Tratamento')[0].firstChild.nodeValue
                    voto_senador = voto.getElementsByTagName('Voto')[0].firstChild.nodeValue

                    to_print_senador.append(codigo_parlamentar)
                    to_print_senador.append(nome_parlamentar)
                    to_print_senador.append(sexo_parlamentar)
                    to_print_senador.append(sigla_partido)
                    to_print_senador.append(sigla_uf)
                    to_print_senador.append(url)
                    to_print_senador.append(foto)
                    to_print_senador.append(tratamento)
                    to_print_senador.append(voto_senador)

                    to_print_final =  '\t'.join(to_print + to_print_senador)
                    fileToWrite.write(to_print_final + "\n")

fileToWrite.close()