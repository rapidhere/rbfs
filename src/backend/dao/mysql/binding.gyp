{
  'targets': [
    {
      'target_name': 'mysql_native',
      'sources': [
        'cc/mysql_native.cc',
        'cc/mysql_connection.cc',
        'cc/utils.cc'],

      'conditions': [
        # Windows Compile Settings
        ['OS=="win"', {
          'include_dirs': [
            '<(mysql_home)/include'
          ],

          'link_settings': {
            'libraries': [
              'libmysql.lib'
            ],
            
            'library_dirs': [
              '<(mysql_home)/lib'
            ]
          },

          # need to copy libmysql.dll to target directory
          'copies': [
            {
              'destination': './build/Release',
              'files': [
                '<(mysql_home)/lib/libmysql.dll'
              ]
            }
          ]
        }]
        # End Windows Compile Settings
      ]
    }
  ]
}