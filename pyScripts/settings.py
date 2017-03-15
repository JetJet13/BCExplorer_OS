import yaml


def get_settings(settings_file='pyScripts/settings.yaml'):
    return yaml.load(open(settings_file, 'r'))


