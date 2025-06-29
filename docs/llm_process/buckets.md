TITLE: Creating Supabase Storage Bucket - Swift
DESCRIPTION: This Swift snippet demonstrates how to create a public Supabase Storage bucket named 'avatars'. It uses the `createBucket` method from the Supabase storage client, specifying the bucket name and public option.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/buckets/creating-buckets.mdx#_snippet_3

LANGUAGE: Swift
CODE:
```
try await supabase.storage.createBucket(
  "avatars",
  options: BucketOptions(public: true)
)
```

----------------------------------------

TITLE: Creating Supabase Storage Bucket - Python
DESCRIPTION: This Python snippet shows how to create a public Supabase Storage bucket named 'avatars'. It calls the `create_bucket` method on the Supabase storage client, passing the bucket name and a dictionary for options including public access.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/buckets/creating-buckets.mdx#_snippet_4

LANGUAGE: Python
CODE:
```
supabase.storage.create_bucket(
  'avatars',
  options={"public": True}
)
```

----------------------------------------

TITLE: Create Supabase Storage Bucket
DESCRIPTION: Demonstrates how to create a new storage bucket named 'avatars' with public access using different Supabase client libraries and SQL.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/buckets/creating-buckets.mdx#_snippet_0

LANGUAGE: JavaScript
CODE:
```
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)

const { data, error } = await supabase.storage.createBucket('avatars', {
  public: true, // default: false
})
```

LANGUAGE: SQL
CODE:
```
-- Use Postgres to create a bucket.

insert into storage.buckets
  (id, name, public)
values
  ('avatars', 'avatars', true);
```

LANGUAGE: Dart
CODE:
```
void main() async {
  final supabase = SupabaseClient('supabaseUrl', 'supabaseKey');

  final storageResponse = await supabase
      .storage
      .createBucket('avatars');
}
```

LANGUAGE: Swift
CODE:
```
try await supabase.storage.createBucket(
  "avatars",
  options: BucketOptions(public: true)
)
```

LANGUAGE: Python
CODE:
```
supabase.storage.create_bucket(
  'avatars',
  options={"public": True}
)
```

----------------------------------------

TITLE: Creating Supabase Storage Bucket - Dart
DESCRIPTION: This Dart snippet illustrates how to create a Supabase Storage bucket named 'avatars' using the Dart client library. It initializes the Supabase client with the URL and key, then calls the `createBucket` method on the storage client.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/buckets/creating-buckets.mdx#_snippet_2

LANGUAGE: Dart
CODE:
```
void main() async {
  final supabase = SupabaseClient('supabaseUrl', 'supabaseKey');

  final storageResponse = await supabase
      .storage
      .createBucket('avatars');
}
```

----------------------------------------

TITLE: Calculate Total Size of Storage Buckets using SQL
DESCRIPTION: This SQL query calculates the total size of all objects within each storage bucket, presenting the result in megabytes. It groups the objects by `bucket_id` and orders the buckets by their total size in descending order, which is useful for identifying which buckets consume the most storage space.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/platform/manage-your-usage/storage-size.mdx#_snippet_1

LANGUAGE: SQL
CODE:
```
select
    bucket_id,
    (sum((metadata->>'size')::int) / 1048576.0)::numeric(10, 2) as total_size_megabyte
from
    storage.objects
group by
    bucket_id
order by
    total_size_megabyte desc;
```

----------------------------------------

TITLE: Create a Supabase Storage bucket
DESCRIPTION: This snippet demonstrates how to create a new storage bucket named 'avatars' using different Supabase client libraries and SQL. Buckets are distinct containers for files and folders, often used to enforce different security and access rules.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/quickstart.mdx#_snippet_0

LANGUAGE: Dashboard
CODE:
```
1. Go to the [Storage](https://supabase.com/dashboard/project/_/storage/buckets) page in the Dashboard.
2. Click **New Bucket** and enter a name for the bucket.
3. Click **Create Bucket**.
```

LANGUAGE: SQL
CODE:
```
-- Use Postgres to create a bucket.

insert into storage.buckets
  (id, name)
values
  ('avatars', 'avatars');
```

LANGUAGE: JavaScript
CODE:
```
// Use the JS library to create a bucket.

const { data, error } = await supabase.storage.createBucket('avatars')
```

LANGUAGE: Dart
CODE:
```
void main() async {
  final supabase = SupabaseClient('supabaseUrl', 'supabaseKey');

  final storageResponse = await supabase
      .storage
      .createBucket('avatars');
}
```

LANGUAGE: Swift
CODE:
```
try await supabase.storage.createBucket("avatars")
```

LANGUAGE: Python
CODE:
```
response = supabase.storage.create_bucket('avatars')
```

----------------------------------------

TITLE: Manage Supabase Storage Buckets via CLI
DESCRIPTION: Provides command-line interface (CLI) commands for managing Supabase Storage buckets and objects. These commands allow users to list all buckets and objects, upload local files to a bucket, download objects from a bucket, and delete files from a bucket. The CLI management is recommended for buckets with less than 100k objects and individual objects smaller than 20MB.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2023-11-06-beta-update-october-2023.mdx#_snippet_1

LANGUAGE: Shell
CODE:
```
supabase storage ls -r
```

LANGUAGE: Shell
CODE:
```
supabase cp -r readme.md ss:///bucket
```

LANGUAGE: Shell
CODE:
```
supabase cp -r ss:///bucket
```

LANGUAGE: Shell
CODE:
```
supabase rm -r ss:///bucket
```

----------------------------------------

TITLE: Creating a Bucket with Python
DESCRIPTION: This Python snippet uses the Supabase client library's `create_bucket` method to create a new storage bucket named 'avatars'. The result of the operation is stored in the `response` variable, allowing for further error checking or confirmation of the bucket's creation status.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/quickstart.mdx#_snippet_4

LANGUAGE: Python
CODE:
```
response = supabase.storage.create_bucket('avatars')
```

----------------------------------------

TITLE: Initialize Supabase Storage Bucket for Avatars
DESCRIPTION: Inserts a new storage bucket named 'avatars' into the 'storage.buckets' table. This bucket is intended for storing user avatar images and is a prerequisite for defining access policies.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/_partials/user_management_quickstart_sql_template.mdx#_snippet_3

LANGUAGE: SQL
CODE:
```
-- Set up Storage!
insert into storage.buckets (id, name)
  values ('avatars', 'avatars');
```

----------------------------------------

TITLE: Supabase Storage: Private Bucket Access Methods
DESCRIPTION: Describes the two primary methods for accessing assets within a private Supabase Storage bucket: direct download with JWT authorization and creating a time-limited signed URL.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/buckets/fundamentals.mdx#_snippet_0

LANGUAGE: APIDOC
CODE:
```
Supabase Storage Private Bucket Access Methods:

1. Download Method:
   - API Reference: storage.from().download()
   - Requirements: Authorization header with user's JWT.
   - Access Control: Governed by RLS policies on `storage.objects` table.
   - Purpose: Securely download assets for authorized users.

2. Create Signed URL Method:
   - API Reference: storage.from().createSignedUrl()
   - Purpose: Generate a temporary, time-limited URL for public access to private assets.
   - Access Control: Bypasses RLS for the duration of the signed URL.
```

----------------------------------------

TITLE: Initializing Storage Bucket for Avatars - Supabase SQL
DESCRIPTION: This SQL statement creates a new storage bucket named 'avatars' within Supabase Storage. This bucket is intended to store user avatar images.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/_partials/user_management_quickstart_sql_template.mdx#_snippet_5

LANGUAGE: SQL
CODE:
```
insert into storage.buckets (id, name)
  values ('avatars', 'avatars');
```

----------------------------------------

TITLE: Restrict Supabase Storage Bucket Uploads by Type and Size
DESCRIPTION: Illustrates how to configure a Supabase Storage bucket to restrict uploads based on allowed MIME types (e.g., 'image/*') and maximum file size (e.g., '1MB') using the JavaScript client library.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/buckets/creating-buckets.mdx#_snippet_1

LANGUAGE: JavaScript
CODE:
```
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)

const { data, error } = await supabase.storage.createBucket('avatars', {
  public: true,
  allowedMimeTypes: ['image/*'],
  fileSizeLimit: '1MB',
})
```

----------------------------------------

TITLE: SQL Policy: Restrict Uploads to PNG Files in 'cats' Bucket
DESCRIPTION: This SQL policy restricts authenticated users to upload only PNG files into a bucket named 'cats'. It combines a check for the bucket ID with the `storage.extension()` helper function to ensure the file type is 'png'.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/schema/helper-functions.mdx#_snippet_5

LANGUAGE: SQL
CODE:
```
create policy "Only allow PNG uploads"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'cats' and storage.extension(name) = 'png'
);
```

----------------------------------------

TITLE: Initialize Supabase Storage Bucket
DESCRIPTION: This SQL command inserts a new entry into the 'storage.buckets' table, creating a storage bucket named 'Product Image' with the ID 'Product Image'. This bucket can be used to store product-related images.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/_partials/product_management_sql_template.mdx#_snippet_1

LANGUAGE: SQL
CODE:
```
insert into storage.buckets (id, name)
  values ('Product Image', 'Product Image');
```

----------------------------------------

TITLE: Creating Supabase Storage Bucket with Restrictions - JavaScript
DESCRIPTION: This JavaScript snippet demonstrates creating a Supabase Storage bucket named 'avatars' with specific upload restrictions. It limits uploads to image files (`image/*`) and sets a maximum file size of 1MB. Requests not meeting these criteria will be rejected.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/buckets/creating-buckets.mdx#_snippet_5

LANGUAGE: JavaScript
CODE:
```
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)

// ---cut---
// Use the JS library to create a bucket.

const { data, error } = await supabase.storage.createBucket('avatars', {
  public: true,
  allowedMimeTypes: ['image/*'],
  fileSizeLimit: '1MB'
})
```

----------------------------------------

TITLE: Storage-js: Bucket Creation and Client Export Changes
DESCRIPTION: `createBucket` now returns a `data` object instead of the bucket name directly. `SupabaseStorageClient` is no longer exported; `StorageClient` should be used instead.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/docs/ref/javascript/release-notes.mdx#_snippet_20

LANGUAGE: APIDOC
CODE:
```
storage-js:
  - `createBucket()`: Returns a `data` object
  - `SupabaseStorageClient`: No longer exported (use `StorageClient` instead)
```

----------------------------------------

TITLE: Seed Supabase Storage Buckets from Local Files
DESCRIPTION: This command uploads files from the local `supabase/images` directory to the 'images' bucket defined in `config.toml`. It's used to populate local storage buckets with initial data.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/local-development/overview.mdx#_snippet_18

LANGUAGE: bash
CODE:
```
supabase seed buckets
```

----------------------------------------

TITLE: Configure Supabase Storage Bucket for Audio
DESCRIPTION: This TOML configuration snippet for `config.toml` defines a new storage bucket named 'audio'. It specifies that the bucket is private, has a file size limit of 50MiB, allows only MP3 audio files, and stores objects in an './audio' path.
SOURCE: https://github.com/supabase/supabase/blob/master/examples/edge-functions/supabase/functions/elevenlabs-text-to-speech/README.md#_snippet_1

LANGUAGE: toml
CODE:
```
[storage.buckets.audio]
public = false
file_size_limit = "50MiB"
allowed_mime_types = ["audio/mp3"]
objects_path = "./audio"
```

----------------------------------------

TITLE: Configure Supabase Storage Buckets Locally
DESCRIPTION: This TOML configuration defines a local storage bucket named 'images' within `supabase/config.toml`. It sets properties like public access, file size limits, allowed MIME types, and specifies a local directory for objects.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/local-development/overview.mdx#_snippet_17

LANGUAGE: toml
CODE:
```
[storage.buckets.images]
public = false
file_size_limit = "50MiB"
allowed_mime_types = ["image/png", "image/jpeg"]
objects_path = "./images"
```

----------------------------------------

TITLE: Restrict Inserts to Authenticated Users and Specific Bucket
DESCRIPTION: An SQL policy that modifies the previous example to only allow authenticated users to upload assets to a specific bucket identified by `my_bucket_id`.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/security/access-control.mdx#_snippet_1

LANGUAGE: sql
CODE:
```
create policy "policy_name"
on storage.objects for insert to authenticated with check (
    -- restrict bucket
    bucket_id = 'my_bucket_id'
);
```

----------------------------------------

TITLE: Downloading Objects from Supabase Storage with CLI
DESCRIPTION: This command downloads all objects from a specified Supabase Storage bucket to the local file system. The `-r` flag ensures recursive download of all contents within the bucket, making it easy to retrieve entire bucket contents.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2023-11-06-beta-update-october-2023.mdx#_snippet_3

LANGUAGE: Shell
CODE:
```
supabase cp -r ss:///bucket
```

----------------------------------------

TITLE: Uploading a File with JavaScript
DESCRIPTION: This JavaScript snippet demonstrates how to upload a file to a Supabase storage bucket. It retrieves the file from an input event (`event.target.files[0]`), then uses the `from()` method to specify the 'avatars' bucket and `upload()` to store the file at 'public/avatar1.png' within that bucket.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/quickstart.mdx#_snippet_5

LANGUAGE: JavaScript
CODE:
```
const avatarFile = event.target.files[0]
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('public/avatar1.png', avatarFile)
```

----------------------------------------

TITLE: Grant Read Access to Supabase Storage Bucket using SQL Policy
DESCRIPTION: This SQL policy grants read (SELECT) access to all objects within a specified bucket, 'avatars', in the Supabase storage system. It leverages Postgres Row Level Security (RLS) on the `storage.objects` table to control access.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2021-03-30-supabase-storage.mdx#_snippet_0

LANGUAGE: SQL
CODE:
```
create policy "Read access for avatars."
on storage.objects for select using (
	bucket_id = 'avatars'
);
```

----------------------------------------

TITLE: Supabase Storage Policy for Public Uploads
DESCRIPTION: This SQL policy grants public users permission to insert objects into a specified Supabase Storage bucket. It's crucial for allowing unauthenticated uploads, which might be required for certain Uppy configurations. Replace 'your-bucket-name' with your actual bucket ID.
SOURCE: https://github.com/supabase/supabase/blob/master/examples/storage/resumable-upload-uppy/README.md#_snippet_0

LANGUAGE: sql
CODE:
```
CREATE POLICY "allow uploads" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'your-bucket-name');
```

----------------------------------------

TITLE: Grant Read Access to Subfolder in Supabase Storage Bucket using SQL Policy
DESCRIPTION: This SQL policy extends the concept of bucket-level access by granting read (SELECT) access specifically to objects within a designated subfolder, 'public', inside the 'avatars' bucket. It utilizes the `storage.foldername()` helper function to identify the subfolder within the object's name.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2021-03-30-supabase-storage.mdx#_snippet_1

LANGUAGE: SQL
CODE:
```
create policy "Read access for public avatars."
on storage.objects for select using (
	bucket_id = 'avatars'
	and (storage.foldername(name))[1] = 'public'
);
```

----------------------------------------

TITLE: Resizing Image with Supabase Storage in Python
DESCRIPTION: This Python example shows how to download and resize an image from a Supabase Storage bucket. It sets `width` to 800, `height` to 300, and `resize` mode to 'contain' within the `transform` dictionary.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/serving/image-transformations.mdx#_snippet_15

LANGUAGE: python
CODE:
```
response = supabase.storage.from_('bucket').download(
  'image.jpg',
  {
    'transform': {
      'width': 800,
      'height': 300,
      'resize': 'contain', # 'cover' | 'fill'
    }
  }
)
```

----------------------------------------

TITLE: Configure Supabase Storage Bucket for Audio
DESCRIPTION: TOML configuration for defining a new Supabase storage bucket named 'audio'. It specifies properties like public access, file size limit, allowed MIME types, and the local path for objects, which will be created upon running `supabase start`.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/functions/examples/elevenlabs-generate-speech-stream.mdx#_snippet_1

LANGUAGE: toml
CODE:
```
[storage.buckets.audio]
public = false
file_size_limit = "50MiB"
allowed_mime_types = ["audio/mp3"]
objects_path = "./audio"
```

----------------------------------------

TITLE: Resizing Image with Supabase Storage in Swift
DESCRIPTION: This Swift example demonstrates downloading and resizing an image from a Supabase Storage bucket. It sets `width` to 800, `height` to 300, and `resize` mode to 'contain' within `TransformOptions`.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/serving/image-transformations.mdx#_snippet_13

LANGUAGE: swift
CODE:
```
let data = try await supabase.storage.from("bucket")
  .download(
    path: "image.jpg",
    options: TransformOptions(
      width: 800,
      height: 300,
      resize: "contain" // "cover" | "fill"
    )
  )
```

----------------------------------------

TITLE: Download Transformed Images with Supabase Storage
DESCRIPTION: This snippet demonstrates how to download an image from a Supabase Storage bucket with specified width and height transformations. It utilizes the `download` function and passes a `transform` option to resize the image before retrieval.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/serving/image-transformations.mdx#_snippet_2

LANGUAGE: JavaScript
CODE:
```
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('your_project_url', 'your_supabase_api_key')

supabase.storage.from('bucket').download('image.jpg', {
  transform: {
    width: 800,
    height: 300,
  },
})
```

LANGUAGE: Dart
CODE:
```
final data = await supabase.storage.from('bucket').download(
      'image.jpg',
      transform: const TransformOptions(
        width: 800,
        height: 300,
      ),
    );
```

LANGUAGE: Swift
CODE:
```
let data = try await supabase.storage.from("bucket")
  .download(
    path: "image.jpg",
    options: TransformOptions(
      width: 800,
      height: 300
    )
  )
```

LANGUAGE: Kotlin
CODE:
```
val data = supabase.storage.from("bucket").downloadAuthenticated("image.jpg") {
    transform {
        size(800, 300)
    }
}

//Or on JVM stream directly to a file
val file = File("image.jpg")
supabase.storage.from("bucket").downloadAuthenticatedTo("image.jpg", file) {
    transform {
        size(800, 300)
    }
}
```

LANGUAGE: Python
CODE:
```
response = supabase.storage.from_('bucket').download(
  'image.jpg',
  {
    'width': 800,
    'height': 300,
  },
)
```

----------------------------------------

TITLE: CLI: Upload Files to Supabase Storage Bucket
DESCRIPTION: Documents the command-line options for `upload.js`, a script used to upload files from a local filesystem folder to a Supabase Storage bucket. It specifies parameters for file prefixes, the source folder, and the target bucket, noting default bucket permissions.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/platform/migrating-to-supabase/firebase-storage.mdx#_snippet_2

LANGUAGE: APIDOC
CODE:
```
node upload.js <prefix> <folder> <bucket>

Parameters:
  <prefix>: The prefix of the files to upload. To process all files, use an empty prefix: "".
  <folder>: Name of subfolder of files to upload. The selected folder is read as a subfolder of the current folder (e.g., ./downloads/). The default is `downloads`.
  <bucket>: Name of the bucket to upload to.

Usage Notes:
  If the bucket doesn't exist, it's created as a `non-public` bucket. You must set permissions on this new bucket in the Supabase Dashboard before users can download any files.
```

----------------------------------------

TITLE: Public Bucket Asset URL Structure
DESCRIPTION: This snippet shows the conventional URL structure for accessing publicly available assets stored in Supabase Storage buckets. Files in public buckets are accessible directly via this URL and benefit from CDN caching.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/serving/downloads.mdx#_snippet_0

LANGUAGE: plaintext
CODE:
```
https://[project_id].supabase.co/storage/v1/object/public/[bucket]/[asset-name]
```

----------------------------------------

TITLE: List Storage Objects Larger Than 5 MB using SQL
DESCRIPTION: This SQL query retrieves the name, bucket ID, and formatted size (in bytes, KB, MB, or GB) of objects in the `storage.objects` table that are larger than 5 MB. It orders the results by size in descending order, providing a quick way to identify large files within your Supabase storage.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/platform/manage-your-usage/storage-size.mdx#_snippet_0

LANGUAGE: SQL
CODE:
```
select
    name,
    bucket_id as bucket,
    case
        when (metadata->>'size')::int >= 1073741824 then
            ((metadata->>'size')::int / 1073741824.0)::numeric(10, 2) || ' GB'
        when (metadata->>'size')::int >= 1048576 then
            ((metadata->>'size')::int / 1048576.0)::numeric(10, 2) || ' MB'
        when (metadata->>'size')::int >= 1024 then
            ((metadata->>'size')::int / 1024.0)::numeric(10, 2) || ' KB'
        else
            (metadata->>'size')::int || ' bytes'
        end as size
from
    storage.objects
where
    (metadata->>'size')::int > 1048576 * 5
order by (metadata->>'size')::int desc
```

----------------------------------------

TITLE: Install Python Dependencies with Poetry
DESCRIPTION: This command adds and installs the required Python libraries – `vecs` (Supabase Vector client), `boto3` (AWS SDK), and `matplotlib` (for image display) – to the project using Poetry, managing their versions and dependencies.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2024-03-26-semantic-image-search-amazon-bedrock.mdx#_snippet_3

LANGUAGE: shell
CODE:
```
poetry add vecs boto3 matplotlib
```

----------------------------------------

TITLE: Call optimized object listing function
DESCRIPTION: Examples demonstrating how to invoke the custom `list_objects` Postgres function to retrieve objects from a specified bucket with pagination. This can be done directly via SQL or using the Supabase JavaScript SDK's `rpc` method.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/production/scaling.mdx#_snippet_1

LANGUAGE: sql
CODE:
```
select * from list_objects('bucket_id', '', 100, 0);
```

LANGUAGE: js
CODE:
```
const { data, error } = await supabase.rpc('list_objects', {
  bucketid: 'yourbucket',
  prefix: '',
  limit: 100,
  offset: 0,
})
```

----------------------------------------

TITLE: Amazon S3 Conditional Writes
DESCRIPTION: Explains S3's native support for conditional operations, enabling developers to build data pipelines that safely update data only when it has not been modified by another process, thereby simplifying transaction management and eliminating the need for complex external systems.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2025-05-29-building-on-open-table-formats.mdx#_snippet_1

LANGUAGE: APIDOC
CODE:
```
Amazon S3 Conditional Writes:
  Description: Native support for conditional operations in S3.
  Functionality:
    - Allows developers to build data pipelines that safely update data.
    - Updates occur only when data has not been modified by another process.
    - Eliminates the need for complex external systems to manage transactions.
```

----------------------------------------

TITLE: Supabase Storage S3 Bucket Operations Compatibility Reference
DESCRIPTION: This API documentation details the compatibility of Supabase Storage with various Amazon S3 bucket operations. It lists which S3 API calls are supported and highlights specific features or headers that are not yet implemented for each operation.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/s3/compatibility.mdx#_snippet_0

LANGUAGE: APIDOC
CODE:
```
API Name: ListBuckets (https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html)
Overall Status: Supported (✅)
Unsupported Features/Headers: None

API Name: HeadBucket (https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadBucket.html)
Overall Status: Supported (✅)
Unsupported Features/Headers:
  - Bucket Owner
  - x-amz-expected-bucket-owner

API Name: CreateBucket (https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html)
Overall Status: Supported (✅)
Unsupported Features/Headers:
  - ACL
  - x-amz-acl
  - x-amz-grant-full-control
  - x-amz-grant-read
  - x-amz-grant-read-acp
  - x-amz-grant-write
  - x-amz-grant-write-acp
  - Object Locking
  - x-amz-bucket-object-lock-enabled
  - Bucket Owner
  - x-amz-expected-bucket-owner

API Name: DeleteBucket (https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteBucket.html)
Overall Status: Supported (✅)
Unsupported Features/Headers:
  - Bucket Owner
  - x-amz-expected-bucket-owner

API Name: GetBucketLocation (https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketLocation.html)
Overall Status: Supported (✅)
Unsupported Features/Headers:
  - Bucket Owner
  - x-amz-expected-bucket-owner

API Name: DeleteBucketCors (https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteBucketCors.html)
Overall Status: Not Supported (❌)
Unsupported Features/Headers:
  - Bucket Owner
  - x-amz-expected-bucket-owner

API Name: GetBucketEncryption (https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketEncryption.html)
Overall Status: Not Supported (❌)
Unsupported Features/Headers:
  - Bucket Owner
  - x-amz-expected-bucket-owner

API Name: GetBucketLifecycleConfiguration (https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketLifecycleConfiguration.html)
Overall Status: Not Supported (❌)
Unsupported Features/Headers:
  - Bucket Owner
  - x-amz-expected-bucket-owner

API Name: GetBucketCors (https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketCors.html)
Overall Status: Not Supported (❌)
Unsupported Features/Headers:
  - Bucket Owner
  - x-amz-expected-bucket-owner
```

----------------------------------------

TITLE: Storage-js: Stricter Return Types and Path Consistency
DESCRIPTION: Return types are now stricter, using union types to indicate nullability only when an error occurs. `upload` and `update` functions now return the object's `path` without the bucket name prepended, improving consistency with other methods.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/docs/ref/javascript/release-notes.mdx#_snippet_18

LANGUAGE: APIDOC
CODE:
```
storage-js:
  - Return types: Stricter, use union types for nullability
  - `upload()` / `update()`: Return `path` (without bucket name, named `path` instead of `Key`)
```

----------------------------------------

TITLE: Exporting Fauna Collections to Amazon S3
DESCRIPTION: This command utilizes the Fauna CLI to export data from a specified Fauna collection to an Amazon S3 bucket. It allows users to back up their data in a simple JSON format before migrating to Supabase. Required parameters include the database name, collection name, S3 bucket name, and an optional path within the bucket.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2025-03-21-migrating-from-fauna-to-supabase.mdx#_snippet_0

LANGUAGE: shell
CODE:
```
fauna export create s3 \
  --database <database_name> \
  --collection <collection_name> \
  --bucket <s3_bucket_name> \
  --path <s3_bucket_path> \
  --format simple
```

----------------------------------------

TITLE: Install Project Dependencies
DESCRIPTION: Commands to install Poetry, activate its virtual environment, and then use it to install the project's Python dependencies.
SOURCE: https://github.com/supabase/supabase/blob/master/examples/ai/aws_bedrock_image_search/README.md#_snippet_0

LANGUAGE: Shell
CODE:
```
pip install poetry
poetry shell
poetry install
```

----------------------------------------

TITLE: Installing Application Dependencies with Poetry - Shell
DESCRIPTION: This command installs all project dependencies defined in the `pyproject.toml` file using Poetry. It ensures all required libraries are available within the virtual environment for the application to run.
SOURCE: https://github.com/supabase/supabase/blob/master/examples/ai/aws_bedrock_image_search/README.md#_snippet_3

LANGUAGE: Shell
CODE:
```
poetry install
```

----------------------------------------

TITLE: AWS S3 CompleteMultipartUpload API Supported Metadata and Headers
DESCRIPTION: Details the supported and unsupported bucket owner and request payer headers for the AWS S3 CompleteMultipartUpload operation.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/s3/compatibility.mdx#_snippet_10

LANGUAGE: APIDOC
CODE:
```
CompleteMultipartUpload API:
  Unsupported Bucket Owner Headers:
    - x-amz-expected-bucket-owner
  Unsupported Request Payer Headers:
    - x-amz-request-payer
```

----------------------------------------

TITLE: Adding Security Policy with SQL
DESCRIPTION: This SQL snippet demonstrates how to create a new Row Level Security (RLS) policy named 'Public Access' on the `storage.objects` table. This policy grants `SELECT` (read) access to objects only if their `bucket_id` is 'public', effectively making files in the 'public' bucket accessible to all users.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/quickstart.mdx#_snippet_11

LANGUAGE: SQL
CODE:
```
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'public' );
```

----------------------------------------

TITLE: Installing Supabase CLI with Scoop on Windows
DESCRIPTION: These commands install the Supabase CLI on Windows using Scoop, a command-line installer. First, it adds the Supabase Scoop bucket, then installs the `supabase` package from that bucket.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/local-development/cli/getting-started.mdx#_snippet_1

LANGUAGE: powershell
CODE:
```
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

----------------------------------------

TITLE: Copy Object Across Supabase Storage Buckets (JavaScript)
DESCRIPTION: Copies an object from one Supabase Storage bucket to another using `supabase.storage.from().copy()` with `destinationBucket`. The user initiating the copy becomes the owner of the new object.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/management/copy-move-objects.mdx#_snippet_1

LANGUAGE: javascript
CODE:
```
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('your_project_url', 'your_supabase_api_key')

// ---cut---
await supabase.storage.from('avatars').copy('public/avatar1.png', 'private/avatar2.png', {
  destinationBucket: 'avatars2',
})
```

----------------------------------------

TITLE: Amazon S3 Express One Zone Storage Class
DESCRIPTION: Details the S3 Express storage class designed for high-performance workloads, offering significantly lower latency, higher throughput, and reduced costs compared to standard S3, making it viable for interactive, near-real-time applications.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2025-05-29-building-on-open-table-formats.mdx#_snippet_0

LANGUAGE: APIDOC
CODE:
```
S3 Express One Zone:
  Description: New storage class for high-performance workloads.
  Key Features:
    - Latency: Up to 10x lower than standard S3.
    - Throughput: Up to 10x higher than standard S3.
    - Cost Reduction: Up to 85 percent lower.
    - Use Case: Viable for interactive, near-real-time applications.
```

----------------------------------------

TITLE: Copy Object within Same Supabase Storage Bucket (JavaScript)
DESCRIPTION: Copies an object from a source path to a destination path within the same Supabase Storage bucket using `supabase.storage.from().copy()`. The user initiating the copy becomes the owner of the new object.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/management/copy-move-objects.mdx#_snippet_0

LANGUAGE: javascript
CODE:
```
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('your_project_url', 'your_supabase_api_key')

// ---cut---
await supabase.storage.from('avatars').copy('public/avatar1.png', 'private/avatar2.png')
```

----------------------------------------

TITLE: Move Object Across Supabase Storage Buckets (JavaScript)
DESCRIPTION: Moves an object from one Supabase Storage bucket to another using `supabase.storage.from().move()` with `destinationBucket`. The original object is deleted, and the new object's owner is the user initiating the move.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/management/copy-move-objects.mdx#_snippet_3

LANGUAGE: javascript
CODE:
```
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('your_project_url', 'your_supabase_api_key')

// ---cut---
await supabase.storage.from('avatars').move('public/avatar1.png', 'private/avatar2.png', {
  destinationBucket: 'avatars2',
})
```

----------------------------------------

TITLE: Create Postgres function for optimized Supabase Storage object listing
DESCRIPTION: This SQL function, `list_objects`, provides a highly optimized way to retrieve objects from a Supabase Storage bucket. Unlike the generic `supabase.storage.list()` method, it directly queries the `storage.objects` table, allowing for faster execution, especially with a large number of objects. It supports filtering by a prefix and includes pagination parameters for efficient data retrieval.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/production/scaling.mdx#_snippet_0

LANGUAGE: sql
CODE:
```
create or replace function list_objects(
    bucketid text,
    prefix text,
    limits int default 100,
    offsets int default 0
) returns table (
    name text,
    id uuid,
    updated_at timestamptz,
    created_at timestamptz,
    last_accessed_at timestamptz,
    metadata jsonb
) as $$
begin
    return query SELECT
        objects.name,
        objects.id,
        objects.updated_at,
        objects.created_at,
        objects.last_accessed_at,
        objects.metadata
    FROM storage.objects
    WHERE objects.name like prefix || '%'
    AND bucket_id = bucketid
    ORDER BY name ASC
    LIMIT limits
    OFFSET offsets;
end;
$$ language plpgsql stable;
```

----------------------------------------

TITLE: Defining Public Read Policy for Avatar Storage - Supabase SQL
DESCRIPTION: This storage policy allows public read access to objects within the 'avatars' bucket. It ensures that anyone can view avatar images stored in this specific bucket.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/_partials/user_management_quickstart_sql_template.mdx#_snippet_6

LANGUAGE: SQL
CODE:
```
create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');
```

----------------------------------------

TITLE: AWS S3 API: DeleteObjects Compatibility
DESCRIPTION: Details the compatibility status of the DeleteObjects S3 API operation, highlighting unsupported features such as Multi-factor authentication, Object Locking bypass, Request Payer, and Expected Bucket Owner checks.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/s3/compatibility.mdx#_snippet_7

LANGUAGE: APIDOC
CODE:
```
Operation: DeleteObjects
Status: Partially Supported (❌ indicates unsupported features)
Unsupported Features:
  - Multi-factor authentication (x-amz-mfa)
  - Object Locking (x-amz-bypass-governance-retention)
  - Request Payer (x-amz-request-payer)
  - Bucket Owner (x-amz-expected-bucket-owner)
```

----------------------------------------

TITLE: Supabase Storage: Download Image with Transformations
DESCRIPTION: Demonstrates how to download an image from a Supabase Storage bucket with specified width, height, quality, and format transformations. This uses the 'transform' option within the download method.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2023-04-12-storage-v3-resumable-uploads.mdx#_snippet_0

LANGUAGE: js
CODE:
```
supabase.storage.from('bucket').download('image.jpg', {
  transform: {
    width: 800,
    height: 300,
    quality: 75,
    format: 'origin'
  }
})
```

----------------------------------------

TITLE: Uploading a File with Dart
DESCRIPTION: This Dart snippet shows how to create a local file (`example.txt`) and then upload it to a Supabase storage bucket. It initializes a Supabase client, writes content to the file, and uploads it to the 'public' bucket using the `from()` and `upload()` methods, demonstrating file preparation before upload.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/quickstart.mdx#_snippet_6

LANGUAGE: Dart
CODE:
```
void main() async {
  final supabase = SupabaseClient('supabaseUrl', 'supabaseKey');

  // Create file `example.txt` and upload it in `public` bucket
  final file = File('example.txt');
  file.writeAsStringSync('File content');
  final storageResponse = await supabase
      .storage
      .from('public')
      .upload('example.txt', file);
}
```

----------------------------------------

TITLE: Move Object within Same Supabase Storage Bucket (JavaScript)
DESCRIPTION: Moves an object from a source path to a destination path within the same Supabase Storage bucket using `supabase.storage.from().move()`. The original object is deleted, and the new object's owner is the user initiating the move.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/management/copy-move-objects.mdx#_snippet_2

LANGUAGE: javascript
CODE:
```
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('your_project_url', 'your_supabase_api_key')

// ---cut---
const { data, error } = await supabase.storage
  .from('avatars')
  .move('public/avatar1.png', 'private/avatar2.png')
```

----------------------------------------

TITLE: Define Vecs Collection with Text Preprocessor (Python Mock)
DESCRIPTION: This mock Python code illustrates a future idea for `vecs` to optionally assign transformation pipelines to collections. It shows how to get or create a collection with a specified dimension and integrate a `TextPreprocessor` model for automatic text vectorization, allowing users to work with media types directly.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2023-05-31-vecs.mdx#_snippet_8

LANGUAGE: Python
CODE:
```
# This is mock code only, not currently functional

docs: Collection =vx.get_or_create_collection(
    docs='docs',
    dimension=512,
    transform = TextPreprocessor(  # this is new
        model="sentence-transformers/all-Mini-L6-v2"
    )
)

docs.upsert([
    ("id_0", "# Some markdown", {}),
    ("id_1", "# Some more markdown", {})
])
```

----------------------------------------

TITLE: GetObject API Compatibility
DESCRIPTION: Outlines the supported conditional operations and range headers, as well as unsupported SSE-C, request payer, and bucket owner headers for the AWS S3 GetObject API operation. This clarifies feature availability when retrieving objects.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/s3/compatibility.mdx#_snippet_4

LANGUAGE: APIDOC
CODE:
```
API: GetObject
Reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html

Supported Parameters/Headers:
  Conditional Operations:
    - If-Match
    - If-Modified-Since
    - If-None-Match
    - If-Unmodified-Since
  Range:
    - Range
    - PartNumber

Unsupported Parameters/Headers:
  SSE-C:
    - x-amz-server-side-encryption-customer-algorithm
    - x-amz-server-side-encryption-customer-key
    - x-amz-server-side-encryption-customer-key-MD5
  Request Payer:
    - x-amz-request-payer
  Bucket Owner:
    - x-amz-expected-bucket-owner
```

----------------------------------------

TITLE: Configure Supabase Storage Bucket Path in config.toml
DESCRIPTION: This TOML configuration block specifies a local directory (`./assets`) whose contents will be automatically uploaded to a Supabase Storage bucket named `assets`. This is useful for managing small assets directly from your local project.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2024-12-04-cli-v2-config-as-code.mdx#_snippet_2

LANGUAGE: toml
CODE:
```
[storage.buckets.assets]
objects_path = "./assets"
```

----------------------------------------

TITLE: Download Supabase Storage Buckets using CLI
DESCRIPTION: This snippet demonstrates how to use the Supabase CLI to log in, link to a project, initialize a local Supabase environment, and then download all files from a specified storage bucket to the current directory. This is useful for archiving project data when direct pausing is not an option.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/troubleshooting/pausing-pro-projects-vNL-2a.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npx supabase login

# link to your project
npx supabase link

npx supabase init

# will download files to current folder
npx supabase storage cp -r ss://bucket . --experimental
```

----------------------------------------

TITLE: Initialize a new Poetry project
DESCRIPTION: Create a new Python project named 'aws_bedrock_image_search' using Poetry.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/ai/examples/semantic-image-search-amazon-titan.mdx#_snippet_1

LANGUAGE: shell
CODE:
```
poetry new aws_bedrock_image_search
```

----------------------------------------

TITLE: AWS S3 ListObjects API Compatibility
DESCRIPTION: Details the supported query parameters for the AWS S3 ListObjects API operation, such as delimiter, encoding-type, marker, max-keys, and prefix, while also indicating the lack of support for Request Payer and Bucket Owner headers.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/s3/compatibility.mdx#_snippet_2

LANGUAGE: APIDOC
CODE:
```
ListObjects:
  Supported Query Parameters:
    - delimiter
    - encoding-type
    - marker
    - max-keys
    - prefix
  Unsupported Parameters:
    Request Payer:
      - x-amz-request-payer
    Bucket Owner:
      - x-amz-expected-bucket-owner
```

----------------------------------------

TITLE: Initialize a New Python Project with Poetry
DESCRIPTION: This command initializes a new Python project named 'aws_bedrock_image_search' using Poetry. It sets up the basic project structure, including a pyproject.toml file.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/www/_blog/2024-03-26-semantic-image-search-amazon-bedrock.mdx#_snippet_1

LANGUAGE: shell
CODE:
```
poetry new aws_bedrock_image_search
```

----------------------------------------

TITLE: Resizing Image with Supabase Storage in JavaScript
DESCRIPTION: This snippet demonstrates how to download and resize an image from a Supabase Storage bucket. It sets `width` to 800, `height` to 300, and `resize` mode to 'contain', which scales the image to fit within the dimensions while maintaining aspect ratio.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/serving/image-transformations.mdx#_snippet_11

LANGUAGE: ts
CODE:
```
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('your_project_url', 'your_supabase_api_key')

supabase.storage.from('bucket').download('image.jpg', {
  transform: {
    width: 800,
    height: 300,
    resize: 'contain', // 'cover' | 'fill'
  },
})
```

----------------------------------------

TITLE: AWS S3 CreateMultipartUpload API Supported Metadata and Headers
DESCRIPTION: Details the supported and unsupported system metadata, website, SSE-C, request payer, tagging, object locking, ACL, storage class, and bucket owner headers for the AWS S3 CreateMultipartUpload operation.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/storage/s3/compatibility.mdx#_snippet_9

LANGUAGE: APIDOC
CODE:
```
CreateMultipartUpload API:
  Supported System Metadata:
    - Content-Type
    - Cache-Control
    - Content-Disposition
    - Content-Encoding
    - Content-Language
    - Expires
  Unsupported System Metadata:
    - Content-MD5
  Unsupported Website Headers:
    - x-amz-website-redirect-location
  Unsupported SSE-C Headers:
    - x-amz-server-side-encryption
    - x-amz-server-side-encryption-customer-algorithm
    - x-amz-server-side-encryption-customer-key
    - x-amz-server-side-encryption-customer-key-MD5
    - x-amz-server-side-encryption-aws-kms-key-id
    - x-amz-server-side-encryption-context
    - x-amz-server-side-encryption-bucket-key-enabled
  Unsupported Request Payer Headers:
    - x-amz-request-payer
  Unsupported Tagging Headers:
    - x-amz-tagging
  Unsupported Object Locking Headers:
    - x-amz-object-lock-mode
    - x-amz-object-lock-retain-until-date
    - x-amz-object-lock-legal-hold
  Unsupported ACL Headers:
    - x-amz-acl
    - x-amz-grant-full-control
    - x-amz-grant-read
    - x-amz-grant-read-acp
    - x-amz-grant-write-acp
  Unsupported Storage Class Headers:
    - x-amz-storage-class
  Unsupported Bucket Owner Headers:
    - x-amz-expected-bucket-owner
```

----------------------------------------

TITLE: Add Python dependencies with Poetry
DESCRIPTION: Add the necessary Python libraries (vecs, boto3, matplotlib) to the project using Poetry.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/ai/examples/semantic-image-search-amazon-titan.mdx#_snippet_3

LANGUAGE: shell
CODE:
```
poetry add vecs boto3 matplotlib
```

----------------------------------------

TITLE: Install Poetry via pip
DESCRIPTION: Install Poetry, a Python packaging and dependency management tool, using pip.
SOURCE: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/ai/examples/semantic-image-search-amazon-titan.mdx#_snippet_0

LANGUAGE: shell
CODE:
```
pip install poetry
```