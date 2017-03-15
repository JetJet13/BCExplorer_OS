import yaml


def get_settings(settings_file='settings.yaml'):
    return yaml.load(open(settings_file, 'r'))


