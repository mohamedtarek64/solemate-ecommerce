<template>

  <div class="admin-products">

    <div class="relative flex size-full min-h-screen flex-col bg-[#1C1C1C] dark group/design-root overflow-x-hidden">

      <div class="flex flex-col lg:flex-row h-full grow">

        <!-- Sidebar -->

        <AdminSidebar />



        <!-- Main Content -->

        <main class="flex-1 p-6 md:p-8">

    <!-- Header -->

          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">

            <div>

              <p class="text-white text-3xl font-bold">

                {{ selectedCategory === 'all' ? 'Products Management' :

                   selectedCategory === 'women' ? 'Women\'s Products' :

                   selectedCategory === 'men' ? 'Men\'s Products' :

                   selectedCategory === 'kids' ? 'Kids Products' : 'Products Management' }}

              </p>

              <p class="text-gray-400">

                {{ selectedCategory === 'all' ? 'Manage your product inventory and catalog' :

                   selectedCategory === 'women' ? 'Manage women\'s footwear and accessories' :

                   selectedCategory === 'men' ? 'Manage men\'s footwear and accessories' :

                   selectedCategory === 'kids' ? 'Manage kids\' footwear and accessories' : 'Manage your product inventory and catalog' }}

              </p>

            </div>

            <div class="flex gap-2">

              <button

                @click="loadProducts"

                :disabled="isLoading"

                class="flex items-center justify-center rounded-md h-10 px-4 bg-[#2C2C2C] text-white text-sm font-medium hover:bg-[#3A3A3A] gap-2 disabled:opacity-50"

              >

                <span class="material-symbols-outlined" :class="{ 'animate-spin': isLoading }">refresh</span>

                <span class="truncate">{{ isLoading ? 'Loading...' : 'Refresh' }}</span>

              </button>

              <button

                @click="showAddProductModal = true"

                class="flex items-center justify-center rounded-md h-10 px-4 bg-[#f97306] text-white text-sm font-medium hover:bg-[#e55a00] gap-2"

              >

                <span class="material-symbols-outlined">add</span>

                <span class="truncate">Add Product</span>

              </button>

      </div>

    </div>



          <!-- Filters -->

          <div class="bg-[#232323] p-6 rounded-md mb-8">

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">

              <div>

                <label class="block text-sm font-medium text-gray-300 mb-2">Search</label>

            <input

              v-model="searchQuery"

              type="text"

                  placeholder="Search products..."

                  class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

            />

          </div>

              <div>

                <label class="block text-sm font-medium text-gray-300 mb-2">Category</label>

                <select

                  v-model="selectedCategory"

                  class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                >

              <option value="all">All Categories</option>

                  <option value="Running">Running</option>

                  <option value="Training">Training</option>

                  <option value="Casual">Casual</option>

                  <option value="Basketball">Basketball</option>

                </select>

              </div>

              <div>

                <label class="block text-sm font-medium text-gray-300 mb-2">Brand</label>

                <select

                  v-model="brandFilter"

                  class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                >

                  <option value="">All Brands</option>

                  <option value="Nike">Nike</option>

                  <option value="Adidas">Adidas</option>

                  <option value="Puma">Puma</option>

                  <option value="New Balance">New Balance</option>

            </select>

          </div>

              <div>

                <label class="block text-sm font-medium text-gray-300 mb-2">Status</label>

                <select

                  v-model="statusFilter"

                  class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                >

              <option value="">All Status</option>

              <option value="active">Active</option>

              <option value="inactive">Inactive</option>

                  <option value="out_of_stock">Out of Stock</option>

            </select>

              </div>

            </div>

            <div class="flex gap-2 mt-4">

              <button

                @click="applyFilters"

                class="px-4 py-2 bg-[#f97306] text-white rounded-md hover:bg-[#e55a00] text-sm font-medium"

              >

                Apply Filters

              </button>

              <button

                @click="clearFilters"

                class="px-4 py-2 bg-[#2C2C2C] text-gray-300 rounded-md hover:bg-[#3A3A3A] text-sm font-medium"

              >

                Clear Filters

              </button>

            </div>

          </div>



          <!-- Product Categories Tabs -->

          <div class="bg-[#232323] p-6 rounded-md mb-8">

            <div class="flex flex-wrap gap-2">

              <button

                v-for="category in (productCategories || [])"

                :key="category.key"

                @click="selectedCategory = category.key"

                :class="[

                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',

                  selectedCategory === category.key

                    ? 'bg-[#f97306] text-white'

                    : 'bg-[#2C2C2C] text-gray-300 hover:bg-[#3A3A3A]'

                ]"

              >

                <span class="material-symbols-outlined text-sm mr-2">{{ category.icon }}</span>

                {{ category.name }} ({{ category.count }})

            </button>

          </div>

          </div>



          <!-- Products Stats -->

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            <div class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">

              <p class="text-gray-300 text-base font-medium">Total Products</p>

              <p class="text-white text-3xl font-bold">{{ totalProducts }}</p>

            </div>

            <div class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">

              <p class="text-gray-300 text-base font-medium">Active Products</p>

              <p class="text-white text-3xl font-bold">{{ activeProducts }}</p>

            </div>

            <div class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">

              <p class="text-gray-300 text-base font-medium">Out of Stock</p>

              <p class="text-white text-3xl font-bold">{{ outOfStockProducts }}</p>

            </div>

            <div class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">

              <p class="text-gray-300 text-base font-medium">Low Stock</p>

              <p class="text-white text-3xl font-bold">{{ lowStockProducts }}</p>

        </div>

      </div>



      <!-- Products Table -->

          <div class="bg-[#232323] p-6 rounded-md">

            <div class="flex justify-between items-center mb-6">

              <h3 class="text-white text-xl font-bold">Products List</h3>

              <div class="flex gap-2">

                <button

                  @click="refreshProducts"

                  :disabled="loading"

                  class="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"

                >

                  <span class="material-symbols-outlined" :class="{ 'animate-spin': loading }">refresh</span>

                  {{ loading ? 'Loading...' : 'Refresh' }}

                </button>

                <button

                  @click="exportProducts(products)"

                  class="flex items-center gap-2 px-3 py-2 bg-[#2C2C2C] text-gray-300 rounded-md hover:bg-[#3A3A3A] text-sm"

                >

                  <span class="material-symbols-outlined">download</span>

                  Export

                </button>

                <button

                  @click="handleDeleteSelected"

                  :disabled="!selectedProducts || selectedProducts.length === 0"

                  class="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50"

                >

                  <span class="material-symbols-outlined">delete</span>

                  Delete Selected ({{ selectedProducts.length }})

                </button>

              </div>

        </div>



            <!-- Loading State -->

            <div v-if="isLoading" class="space-y-4">

              <div v-for="i in 5" :key="i" class="animate-pulse">

                <div class="h-16 bg-[#2C2C2C] rounded-md"></div>

              </div>

        </div>



        <!-- Empty State -->

            <div v-else-if="!filteredProducts || filteredProducts.length === 0" class="text-center py-12 text-gray-400">

              <span class="material-symbols-outlined text-6xl mb-4">inventory_2</span>

              <p class="text-xl mb-2">No products found</p>

              <p class="text-sm">Try adjusting your filters or add a new product</p>

        </div>



        <!-- Products Table -->

            <div v-else class="overflow-x-auto">

              <table class="w-full text-left">

                <thead>

                  <tr class="border-b border-gray-700">

                    <th class="py-3 px-4 text-sm font-medium text-gray-300">

                      <input

                        type="checkbox"

                        :checked="selectedProducts && filteredProducts && selectedProducts.length === filteredProducts.length"

                        @change="toggleSelectAll"

                        class="w-4 h-4 text-[#f97306] bg-[#2C2C2C] border-gray-600 rounded focus:ring-[#f97306]"

                      />

                    </th>

                    <th class="py-3 px-4 text-sm font-medium text-gray-300">Product</th>

                    <th class="py-3 px-4 text-sm font-medium text-gray-300">Brand</th>

                    <th class="py-3 px-4 text-sm font-medium text-gray-300">Category</th>

                    <th class="py-3 px-4 text-sm font-medium text-gray-300">Colors</th>

                    <th class="py-3 px-4 text-sm font-medium text-gray-300">Price</th>

                    <th class="py-3 px-4 text-sm font-medium text-gray-300">Stock</th>

                    <th class="py-3 px-4 text-sm font-medium text-gray-300">Status</th>

                    <th class="py-3 px-4 text-sm font-medium text-gray-300">Actions</th>

              </tr>

            </thead>

                <tbody>

                  <tr

                    v-for="product in (filteredProducts || [])"

                    :key="product.id"

                    class="border-b border-gray-800 hover:bg-[#2C2C2C]"

                  >

                    <td class="py-3 px-4">

                      <input

                        type="checkbox"

                        :value="product.id"

                        v-model="selectedProducts"

                        class="w-4 h-4 text-[#f97306] bg-[#2C2C2C] border-gray-600 rounded focus:ring-[#f97306]"

                      />

                    </td>

                    <td class="py-3 px-4">

                  <div class="flex items-center gap-3">

                        <div class="w-12 h-12 bg-[#2C2C2C] rounded-md overflow-hidden relative">

                      <img

                            v-if="product.image || product.image_url"

                            :src="product.image || product.image_url"

                        :alt="product.name"

                            class="w-full h-full object-cover"

                            @error="handleImageError"

                            loading="lazy"

                      />

                          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">

                            <span class="material-symbols-outlined">image</span>

                          </div>

                    </div>

                        <div>

                          <p class="text-white font-medium">{{ product.name }}</p>

                          <p class="text-gray-400 text-sm">ID: {{ product.id }}</p>

                          <p v-if="product.original_category && product.original_category !== product.category" class="text-gray-500 text-xs">

                            Original: {{ product.original_category }}

                          </p>

                    </div>

                  </div>

                </td>

                    <td class="py-3 px-4 text-sm text-gray-400">{{ product.brand || 'N/A' }}</td>

                    <td class="py-3 px-4 text-sm text-gray-400">{{ product.category || 'N/A' }}</td>

                    <td class="py-3 px-4 text-sm">

                      <div class="flex flex-wrap gap-1">

                  <span

                          v-for="color in (product.colors || []).slice(0, 3)"

                          :key="color.id || color.code"

                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300"

                  >

                          {{ color.color_name || color.name || color.code || 'Unknown' }}

                  </span>

                        <span

                          v-if="(product.colors || []).length > 3"

                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-600 text-gray-400"

                        >

                          +{{ (product.colors || []).length - 3 }}

                        </span>

                        <span v-if="!product.colors || product.colors.length === 0" class="text-gray-500 text-xs">No colors</span>

                  </div>

                </td>

                    <td class="py-3 px-4 text-sm text-white font-medium">{{ formatCurrency(product.price) }}</td>

                    <td class="py-3 px-4 text-sm text-gray-400">{{ product.quantity || 0 }}</td>

                    <td class="py-3 px-4 text-sm">

                      <span

                        :class="[

                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',

                          getProductStatusClass(product)

                        ]"

                      >

                        {{ getProductStatus(product) }}

                      </span>

                    </td>

                    <td class="py-3 px-4">

                      <div class="flex gap-1">

                        <!-- View Button -->

                    <button

                          @click="viewProduct(product)"

                          class="group relative p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-md transition-all duration-200"

                      title="View Product"

                    >

                          <span class="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">visibility</span>

                    </button>



                        <!-- Edit Button -->

                    <button

                          @click="editProduct(product)"

                          class="group relative p-2 text-gray-400 hover:text-green-400 hover:bg-green-900/20 rounded-md transition-all duration-200"

                      title="Edit Product"

                    >

                          <span class="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">edit</span>

                        </button>



                        <!-- More Actions Dropdown -->

                        <div class="relative">

                          <button

                            @click="toggleMoreActions(product.id)"

                            class="group relative p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded-md transition-all duration-200"

                            title="More Actions"

                          >

                            <span class="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">more_vert</span>

                          </button>



                          <!-- Dropdown Menu -->

                          <div

                            v-if="showMoreActions === product.id"

                            class="absolute right-0 top-full mt-1 w-48 bg-[#2C2C2C] border border-gray-600 rounded-md shadow-lg z-10"

                          >

                            <div class="py-1">

                              <button

                                @click="duplicateProduct(product); showMoreActions = null"

                                class="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"

                              >

                                <span class="material-symbols-outlined text-sm mr-2">content_copy</span>

                                Duplicate

                              </button>

                              <button

                                @click="toggleProductStatus(product, loadProducts); showMoreActions = null"

                                class="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"

                              >

                                <span class="material-symbols-outlined text-sm mr-2">{{ product.is_active === 1 ? 'visibility_off' : 'visibility' }}</span>

                      {{ product.is_active === 1 ? 'Deactivate' : 'Activate' }}

                    </button>

                    <button

                                @click="exportSingleProduct(product); showMoreActions = null"

                                class="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"

                              >

                                <span class="material-symbols-outlined text-sm mr-2">download</span>

                                Export

                    </button>

                              <hr class="my-1 border-gray-600">

                              <button

                                @click="performDelete(product); showMoreActions = null"

                                class="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"

                              >

                                <span class="material-symbols-outlined text-sm mr-2">delete</span>

                      Delete

                    </button>

                            </div>

                          </div>

                        </div>

                  </div>

                </td>

              </tr>

            </tbody>

          </table>

            </div>



          <!-- Pagination -->

            <div v-if="totalPages > 1" class="flex justify-between items-center mt-6">

              <p class="text-gray-400 text-sm">

                Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, totalProducts || 0) }} of {{ totalProducts || 0 }} products

              </p>

              <div class="flex gap-2">

              <button

                  @click="currentPage = Math.max(1, currentPage - 1)"

                  :disabled="currentPage === 1"

                  class="px-3 py-2 bg-[#2C2C2C] text-gray-300 rounded-md hover:bg-[#3A3A3A] disabled:opacity-50 text-sm"

              >

                Previous

              </button>

              <button

                  v-for="page in visiblePages"

                :key="page"

                  @click="currentPage = page"

                  :class="[

                    'px-3 py-2 rounded-md text-sm',

                    page === currentPage

                      ? 'bg-[#f97306] text-white'

                      : 'bg-[#2C2C2C] text-gray-300 hover:bg-[#3A3A3A]'

                  ]"

                >

                {{ page }}

              </button>

              <button

                  @click="currentPage = Math.min(totalPages, currentPage + 1)"

                  :disabled="currentPage === totalPages"

                  class="px-3 py-2 bg-[#2C2C2C] text-gray-300 rounded-md hover:bg-[#3A3A3A] disabled:opacity-50 text-sm"

              >

                Next

              </button>

            </div>

          </div>

        </div>

        </main>

      </div>

    </div>

  </div>



  <!-- Add Product Modal -->

  <div v-if="showAddProductModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

    <div class="bg-[#232323] p-6 rounded-md w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">

      <div class="flex justify-between items-center mb-6">

        <h3 class="text-white text-xl font-bold">Add New Product</h3>

        <button

          @click="showAddProductModal = false"

          class="text-gray-400 hover:text-white"

        >

          <span class="material-symbols-outlined">close</span>

        </button>

      </div>



      <form @submit.prevent="addProduct(loadProducts, showToastMessage)" class="space-y-6">

        <!-- Basic Information -->

        <div class="bg-[#2C2C2C] p-4 rounded-md">

          <h4 class="text-white text-lg font-semibold mb-4">Basic Information</h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>

              <label class="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>

              <input

                v-model="newProduct.name"

                type="text"

                required

                class="w-full px-3 py-2 bg-[#1C1C1C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                placeholder="Enter product name"

              />

            </div>

            <div>

              <label class="block text-sm font-medium text-gray-300 mb-2">Slug</label>

              <input

                v-model="newProduct.slug"

                type="text"

                class="w-full px-3 py-2 bg-[#1C1C1C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                placeholder="product-name-slug"

              />

            </div>

            <div>

              <label class="block text-sm font-medium text-gray-300 mb-2">SKU *</label>

              <input

                v-model="newProduct.sku"

                type="text"

                required

                class="w-full px-3 py-2 bg-[#1C1C1C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                placeholder="PROD-001"

              />

            </div>

            <div>

              <label class="block text-sm font-medium text-gray-300 mb-2">Brand *</label>

              <select

                v-model="newProduct.brand"

                required

                class="w-full px-3 py-2 bg-[#1C1C1C] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]"

              >

                <option value="">Select Brand</option>

                <option value="Nike">Nike</option>

                <option value="Adidas">Adidas</option>

                <option value="Puma">Puma</option>

                <option value="New Balance">New Balance</option>

                <option value="Converse">Converse</option>

                <option value="Vans">Vans</option>

                <option value="Jordan">Jordan</option>

                <option value="Reebok">Reebok</option>

              </select>

            </div>

            <div>

              <label class="block text-sm font-medium text-gray-300 mb-2">Gender *</label>

              <select

                v-model="newProduct.gender"

                required

                class="w-full px-3 py-2 bg-[#1C1C1C] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]"

              >

                <option value="">Select Gender</option>

                <option value="women">Women</option>

                <option value="men">Men</option>

              </select>

            </div>

            <div>

              <label class="block text-sm font-medium text-gray-300 mb-2">Category *</label>

              <select

                v-model="newProduct.category"

                required

                class="w-full px-3 py-2 bg-[#1C1C1C] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]"

              >

                <option value="">Select Category</option>

                <option value="Sneakers">Sneakers</option>

                <option value="Running">Running</option>

                <option value="Training">Training</option>

                <option value="Casual">Casual</option>

                <option value="Basketball">Basketball</option>

                <option value="Football">Football</option>

                <option value="Tennis">Tennis</option>

              </select>

            </div>

            <div>

              <label class="block text-sm font-medium text-gray-300 mb-2">Price *</label>

              <input

                v-model="newProduct.price"

                type="number"

                step="0.01"

                required

                class="w-full px-3 py-2 bg-[#1C1C1C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                placeholder="0.00"

              />

            </div>

            <div>

              <label class="block text-sm font-medium text-gray-300 mb-2">Quantity *</label>

              <input

                v-model="newProduct.quantity"

                type="number"

                required

                class="w-full px-3 py-2 bg-[#1C1C1C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                placeholder="0"

              />

            </div>

            <div>

              <label class="block text-sm font-medium text-gray-300 mb-2">Status</label>

              <select

                v-model="newProduct.status"

                class="w-full px-3 py-2 bg-[#1C1C1C] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]"

              >

                <option value="draft">Draft</option>

                <option value="active">Active</option>

                <option value="inactive">Inactive</option>

                <option value="archived">Archived</option>

              </select>

            </div>

          </div>

        </div>





        <!-- Product Descriptions -->

        <div class="bg-[#2C2C2C] p-4 rounded-md">

          <h4 class="text-white text-lg font-semibold mb-4">Product Descriptions</h4>

          <div class="space-y-4">

            <div>

              <label class="block text-sm font-medium text-gray-300 mb-2">Short Description</label>

              <input

                v-model="newProduct.short_description"

                type="text"

                class="w-full px-3 py-2 bg-[#1C1C1C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                placeholder="Brief product description"

              />

            </div>

            <div>

              <label class="block text-sm font-medium text-gray-300 mb-2">Description *</label>

              <textarea

                v-model="newProduct.description"

                rows="4"

                required

                class="w-full px-3 py-2 bg-[#1C1C1C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                placeholder="Enter detailed product description"

              ></textarea>

            </div>

          </div>

        </div>



        <!-- Colors Section -->

        <div>

          <label class="block text-sm font-medium text-gray-300 mb-2">Product Colors</label>

          <div v-if="!newProduct.colors || newProduct.colors.length === 0" class="text-center py-8 border-2 border-dashed border-gray-600 rounded-md">

            <span class="material-symbols-outlined text-4xl text-gray-400 mb-2">palette</span>

            <p class="text-gray-400 mb-4">No colors added yet</p>

            <button

              type="button"

              @click="addColor"

              class="px-4 py-2 bg-[#f97306] text-white rounded-md hover:bg-[#e55a00] text-sm"

            >

              + Add First Color

            </button>

          </div>

          <div v-else class="space-y-3">

            <div v-for="(color, index) in newProduct.colors" :key="index" class="border border-gray-600 rounded-md p-4 mb-4">

              <div class="flex justify-between items-center mb-3">

                <h5 class="text-white font-medium">Color {{ index + 1 }}</h5>

                <button

                  type="button"

                  @click="removeColor(index)"

                  class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"

                >

                  Remove

                </button>

              </div>



              <!-- Basic Color Info -->

              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">

                <div>

                  <label class="block text-xs text-gray-400 mb-1">Color Code *</label>

                  <input

                    v-model="color.code"

                    type="text"

                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                    placeholder="e.g., #FF0000 or Red"

                  />

                </div>

                <div>

                  <label class="block text-xs text-gray-400 mb-1">Color Name</label>

                  <input

                    v-model="color.name"

                    type="text"

                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                    placeholder="e.g., Red"

                  />

                </div>

                <div>

                  <label class="block text-xs text-gray-400 mb-1">Price</label>

                  <input

                    v-model="color.price"

                    type="number"

                    step="0.01"

                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                    placeholder="0.00"

                  />

                </div>

                <div>

                  <label class="block text-xs text-gray-400 mb-1">Quantity</label>

                  <input

                    v-model="color.quantity"

                    type="number"

                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                    placeholder="0"

                  />

                </div>

              </div>



              <!-- Media for this color -->

              <div class="space-y-3">

                <div>

                  <label class="block text-xs text-gray-400 mb-1">Main Image URL</label>

                  <input

                    v-model="color.image_url"

                    type="url"

                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                    placeholder="https://example.com/color-image.jpg"

                  />

                </div>



                <div>

                  <label class="block text-xs text-gray-400 mb-1">Additional Images (comma separated URLs)</label>

                  <input

                    v-model="color.images"

                    type="text"

                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                    placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"

                  />

                </div>



                <div>

                  <label class="block text-xs text-gray-400 mb-1">Video URL</label>

                  <input

                    v-model="color.video_url"

                    type="url"

                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                    placeholder="https://example.com/color-video.mp4"

                  />

                </div>



                <div>

                  <label class="block text-xs text-gray-400 mb-1">Additional Videos (comma separated URLs)</label>

                  <input

                    v-model="color.videos"

                    type="text"

                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                    placeholder="https://example.com/video1.mp4, https://example.com/video2.mp4"

                  />

                </div>



                <div>

                  <label class="block text-xs text-gray-400 mb-1">Gallery Images (comma separated URLs)</label>

                  <input

                    v-model="color.gallery_images"

                    type="text"

                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"

                    placeholder="https://example.com/gallery1.jpg, https://example.com/gallery2.jpg"

                  />

                </div>

              </div>

            </div>

            <button

              type="button"

              @click="addColor"

              class="px-4 py-2 bg-[#2C2C2C] text-gray-300 rounded-md hover:bg-[#3A3A3A] text-sm border border-gray-600"

            >

              + Add Color

            </button>

          </div>

        </div>



        <!-- Test Mode Section -->

        <div class="mt-6 p-4 bg-[#1C1C1C] border border-gray-600 rounded-md">

          <div class="flex items-center gap-2 mb-3">

            <span class="material-symbols-outlined text-[#f97306]">science</span>

            <h4 class="text-white font-medium">Test Mode - Quick Fill</h4>

          </div>

          <p class="text-gray-400 text-sm mb-3">Fill form with test data for quick testing</p>



          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">

            <button

              @click="fillTestProductData"

              class="px-3 py-2 bg-[#f97306] text-white rounded-md hover:bg-[#e55a00] text-sm flex items-center gap-2"

            >

              <span class="material-symbols-outlined text-sm">auto_fix_high</span>

              Fill Product Data

            </button>



            <button

              @click="fillTestColors"

              class="px-3 py-2 bg-[#2C2C2C] text-gray-300 rounded-md hover:bg-[#3A3A3A] text-sm flex items-center gap-2"

            >

              <span class="material-symbols-outlined text-sm">palette</span>

              Add Test Colors

            </button>



            <button

              @click="clearAllData"

              class="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm flex items-center gap-2"

            >

              <span class="material-symbols-outlined text-sm">clear_all</span>

              Clear All

            </button>

          </div>



          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">

            <button

              @click="copyToClipboard('Nike Air Max 270')"

              class="px-2 py-1 bg-[#2C2C2C] text-gray-300 rounded text-xs hover:bg-[#3A3A3A] text-left"

            >

              📝 Nike Air Max 270

            </button>

            <button

              @click="copyToClipboard('High-performance running shoes with Air Max technology')"

              class="px-2 py-1 bg-[#2C2C2C] text-gray-300 rounded text-xs hover:bg-[#3A3A3A] text-left"

            >

              📝 Running description

            </button>

            <button

              @click="copyToClipboard('NK-AM270-001')"

              class="px-2 py-1 bg-[#2C2C2C] text-gray-300 rounded text-xs hover:bg-[#3A3A3A] text-left"

            >

              📝 SKU: NK-AM270-001

            </button>

            <button

              @click="copyToClipboard('Adidas Ultraboost 22')"

              class="px-2 py-1 bg-[#2C2C2C] text-gray-300 rounded text-xs hover:bg-[#3A3A3A] text-left"

            >

              📝 Adidas Ultraboost 22

            </button>

          </div>

        </div>



        <div class="flex gap-2 pt-4">

          <button

            type="submit"

            :disabled="isSubmitting"

            class="flex-1 px-4 py-2 bg-[#f97306] text-white rounded-md hover:bg-[#e55a00] disabled:opacity-50"

          >

            {{ isSubmitting ? 'Adding...' : 'Add Product' }}

          </button>

          <button

            type="button"

            @click="showAddProductModal = false; resetNewProductForm()"

            class="flex-1 px-4 py-2 bg-[#2C2C2C] text-gray-300 rounded-md hover:bg-[#3A3A3A]"

          >

            Cancel

          </button>

        </div>

      </form>

    </div>

  </div>





  <!-- Confirmation Modal -->

  <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

    <div class="bg-[#232323] p-6 rounded-md w-full max-w-md mx-4">

      <div class="flex items-center gap-3 mb-4">

        <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="confirmModal?.type === 'delete' ? 'bg-red-900' : 'bg-yellow-900'">

          <span class="material-symbols-outlined text-white" :class="confirmModal?.type === 'delete' ? 'text-red-300' : 'text-yellow-300'">

            {{ confirmModal?.type === 'delete' ? 'warning' : 'info' }}

          </span>

        </div>

        <h3 class="text-white text-xl font-bold">{{ confirmModal?.title || '' }}</h3>

      </div>



      <p class="text-gray-300 mb-6">{{ confirmModal?.message || '' }}</p>



      <div class="flex gap-3 justify-end">

        <button

          @click="showConfirmModal = false"

          class="px-4 py-2 bg-[#2C2C2C] text-gray-300 rounded-md hover:bg-[#3A3A3A] transition-colors duration-200"

        >

          Cancel

        </button>

        <button

          @click="confirmAction"

          :class="[

            'px-4 py-2 rounded-md transition-colors duration-200',

            confirmModal?.type === 'delete'

              ? 'bg-red-600 text-white hover:bg-red-700'

              : 'bg-[#f97306] text-white hover:bg-[#e55a00]'

          ]"

        >

          {{ confirmModal?.confirmText || 'Confirm' }}

        </button>

      </div>

    </div>

  </div>



  <!-- Product View Modal -->

  <div v-if="showProductModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

    <div class="bg-[#2C2C2C] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">

      <div class="flex justify-between items-center mb-4">

        <h3 class="text-xl font-semibold text-white">Product Details</h3>

        <button @click="showProductModal = false" class="text-gray-400 hover:text-white">

          <span class="material-symbols-outlined">close</span>

        </button>

      </div>



      <div v-if="selectedProduct" class="space-y-4">

        <div class="grid grid-cols-2 gap-4">

          <div>

            <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>

            <p class="text-white">{{ selectedProduct.name }}</p>

          </div>

          <div>

            <label class="block text-sm font-medium text-gray-300 mb-1">SKU</label>

            <p class="text-white">{{ selectedProduct.sku }}</p>

          </div>

          <div>

            <label class="block text-sm font-medium text-gray-300 mb-1">Price</label>

            <p class="text-white">{{ formatCurrency(selectedProduct.price) }}</p>

          </div>

          <div>

            <label class="block text-sm font-medium text-gray-300 mb-1">Status</label>

            <span :class="[

              'px-2 py-1 rounded-full text-xs font-medium',

              selectedProduct.status === 'active'

                ? 'bg-green-900 text-green-300'

                : 'bg-gray-900 text-gray-300'

            ]">

              {{ selectedProduct.status }}

            </span>

          </div>

        </div>



        <div>

          <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>

          <p class="text-white">{{ selectedProduct.description }}</p>

        </div>

      </div>



      <div class="flex justify-end mt-6">

        <button

          @click="showProductModal = false"

          class="px-4 py-2 bg-[#f97306] text-white rounded-md hover:bg-[#e55a00] transition-colors duration-200"

        >

          Close

        </button>

      </div>

    </div>

  </div>



  <!-- Product Edit Modal -->

  <div v-if="showEditProductModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

    <div class="bg-[#2C2C2C] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">

      <div class="flex justify-between items-center mb-4">

        <h3 class="text-xl font-semibold text-white">Edit Product</h3>

        <button @click="showEditProductModal = false" class="text-gray-400 hover:text-white">

          <span class="material-symbols-outlined">close</span>

        </button>

      </div>



      <form @submit.prevent="handleUpdateProduct" class="space-y-4">

        <div class="grid grid-cols-2 gap-4">

          <div>

            <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>

            <input

              v-model="editProductForm.name"

              type="text"

              class="w-full px-3 py-2 bg-[#3A3A3A] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]"

              required

            />

          </div>

          <div>

            <label class="block text-sm font-medium text-gray-300 mb-1">Price</label>

            <input

              v-model="editProductForm.price"

              type="number"

              step="0.01"

              class="w-full px-3 py-2 bg-[#3A3A3A] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]"

              required

            />

          </div>

        </div>



        <div class="grid grid-cols-2 gap-4">

          <div>

            <label class="block text-sm font-medium text-gray-300 mb-1">Brand</label>

            <input

              v-model="editProductForm.brand"

              type="text"

              class="w-full px-3 py-2 bg-[#3A3A3A] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]"

              required

            />

          </div>

          <div>

            <label class="block text-sm font-medium text-gray-300 mb-1">Stock</label>

            <input

              v-model="editProductForm.stock"

              type="number"

              class="w-full px-3 py-2 bg-[#3A3A3A] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]"

              required

            />

          </div>

        </div>



        <div class="grid grid-cols-2 gap-4">

          <div>

            <label class="block text-sm font-medium text-gray-300 mb-1">SKU</label>

            <input

              v-model="editProductForm.sku"

              type="text"

              class="w-full px-3 py-2 bg-[#3A3A3A] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]"

              required

            />

          </div>

          <div>

            <label class="block text-sm font-medium text-gray-300 mb-1">Category</label>

            <select

              v-model="editProductForm.category"

              class="w-full px-3 py-2 bg-[#3A3A3A] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]"

              required

            >

              <option value="Men">Men</option>

              <option value="Women">Women</option>

              <option value="Kids">Kids</option>

            </select>

          </div>

        </div>



        <div>

          <label class="block text-sm font-medium text-gray-300 mb-1">Status</label>

          <select

            v-model="editProductForm.status"

            class="w-full px-3 py-2 bg-[#3A3A3A] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]"

            required

          >

            <option value="active">Active</option>

            <option value="inactive">Inactive</option>

          </select>

        </div>



        <div>

          <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>

          <textarea

            v-model="editProductForm.description"

            rows="3"

            class="w-full px-3 py-2 bg-[#3A3A3A] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]"

          ></textarea>

        </div>



        <div class="flex justify-end gap-3">

          <button

            type="button"

            @click="showEditProductModal = false"

            class="px-4 py-2 bg-[#3A3A3A] text-gray-300 rounded-md hover:bg-[#4A4A4A] transition-colors duration-200"

          >

            Cancel

          </button>

          <button

            type="submit"

            :disabled="isSubmitting"

            class="px-4 py-2 bg-[#f97306] text-white rounded-md hover:bg-[#e55a00] transition-colors duration-200 disabled:opacity-50"

          >

            {{ isSubmitting ? 'Updating...' : 'Update Product' }}

          </button>

        </div>

      </form>

    </div>

  </div>



  <!-- Delete Confirmation Modal -->

  <div

    v-if="showDeleteConfirmModal"

    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"

  >

    <div class="bg-[#232323] p-6 rounded-md max-w-md w-full mx-4">

      <div class="flex items-center gap-3 mb-4">

        <span class="material-symbols-outlined text-red-500 text-2xl">warning</span>

        <h3 class="text-white text-lg font-bold">Delete Selected Products</h3>

      </div>

      <p class="text-gray-300 mb-6">

        Are you sure you want to delete {{ selectedProducts.length }} selected products? This action cannot be undone.

      </p>

      <div class="flex justify-end gap-3">

        <button

          @click="showDeleteConfirmModal = false"

          class="px-4 py-2 bg-[#3A3A3A] text-gray-300 rounded-md hover:bg-[#4A4A4A] transition-colors duration-200"

        >

          Cancel

        </button>

        <button

          @click="confirmDeleteSelected"

          :disabled="isSubmitting"

          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"

        >

          {{ isSubmitting ? 'Deleting...' : 'Delete Products' }}

        </button>

      </div>

    </div>

  </div>



  <!-- Toast Notification -->

  <div

    v-if="showToast"

    class="fixed top-4 right-4 z-50 max-w-sm w-full"

  >

    <div

      :class="[

        'p-4 rounded-md shadow-lg border-l-4 transition-all duration-300',

        toastType === 'success'

          ? 'bg-green-900 border-green-500 text-green-300'

          : 'bg-red-900 border-red-500 text-red-300'

      ]"

    >

      <div class="flex items-center">

        <span class="material-symbols-outlined mr-2">

          {{ toastType === 'success' ? 'check_circle' : 'error' }}

        </span>

        <p class="font-medium">{{ toastMessage }}</p>

      </div>

    </div>

  </div>

</template>



<script setup>

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

import { useRouter } from 'vue-router'

import { useAdminDashboard } from '@/composables/useAdminDashboard'

import AdminSidebar from '@/components/admin/AdminSidebar.vue'

import { useProductData } from '@/composables/useProductData.js'

import { useProductActions } from '@/composables/useProductActions.js'

import { useProductForms } from '@/composables/useProductForms.js'
// ✅ Enhanced Admin Optimization
import { useAdminOptimization } from '@/composables/useAdminOptimization'
import VirtualScroll from '@/components/common/VirtualScroll.vue'
import OptimizedImage from '@/components/common/OptimizedImage.vue'
import performanceMonitorEnhanced from '@/utils/performanceMonitorEnhanced'

import {

  useProductsState,

  useProductsActions,

  useProductsForms,

  useProductsComputed,

  useProductsUtils,

  useProductsAPI,

  initializeProducts

} from '@/composables/admin/Products.js'

import OptimizedLoading from '@/components/OptimizedLoading.vue'

import { useOptimizedProducts, usePaginatedApi } from '@/composables/useOptimizedApi.js'

import { useLoadingState } from '@/utils/loadingStates.js'



// State

const {

  products,

  loading,

  error,

  filters,

  pagination,

  selectedProduct,

  showAddModal,

  showEditModal,

  showDeleteModal,

  showViewModal

} = useProductsState()



// Initialize with empty array - data will be loaded from API

products.value = []



  // Computed

const {

  filteredProducts,

  totalProducts,

  activeProducts,

  lowStockProducts

} = useProductsComputed(products, filters)



// UI filters bound to filters state

const selectedCategory = computed({

  get: () => filters.value.category || 'all',

  set: v => { filters.value.category = v }

})

const searchQuery = computed({

  get: () => filters.value.search || '',

  set: v => { filters.value.search = v }

})

const brandFilter = computed({

  get: () => filters.value.brand || '',

  set: v => { filters.value.brand = v }

})

const statusFilter = computed({

  get: () => filters.value.status || '',

  set: v => { filters.value.status = v }

})



// Alias to match template naming

const isLoading = loading

const outOfStockProducts = lowStockProducts



// API

const { loadProducts, createProduct, updateProduct, deleteProduct, deleteSelectedProducts: deleteSelectedProductsAPI } = useProductsAPI(products, loading, error)



// Actions

const { filterProducts, searchProducts, exportProducts } = useProductsActions()

// Refresh function
const refreshProducts = async () => {
  try {
    await loadProducts()
    showToastMessage('Products refreshed successfully!', 'success')
  } catch (error) {
    console.error('❌ Error refreshing products:', error)
    showToastMessage('Failed to refresh products', 'error')
  }
}



// Delete selected products functionality

const handleDeleteSelected = async () => {

  if (selectedProducts.value.length === 0) {

    showToastMessage('Please select products to delete', 'error')

    return

  }



  showDeleteConfirmModal.value = true

}



const confirmDeleteSelected = async () => {

  try {

    isSubmitting.value = true

    const result = await deleteSelectedProductsAPI(selectedProducts.value)



    if (result.success) {

      showToastMessage(`Successfully deleted ${result.deleted_count} products`, 'success')

      selectedProducts.value = []

      await loadProducts()

    } else {

      showToastMessage(result.message || 'Failed to delete products', 'error')

    }

  } catch (error) {

    console.error('Error deleting selected products:', error)

    showToastMessage('Failed to delete products: ' + error.message, 'error')

  } finally {

    isSubmitting.value = false

    showDeleteConfirmModal.value = false

  }

}



const toggleProductSelection = (productId) => {

  const index = selectedProducts.value.indexOf(productId)

  if (index > -1) {

    selectedProducts.value.splice(index, 1)

  } else {

    selectedProducts.value.push(productId)

  }

}



const selectAllProducts = () => {

  if (selectedProducts.value.length === filteredProducts.value.length) {

    selectedProducts.value = []

  } else {

    selectedProducts.value = filteredProducts.value.map(p => p.id)

  }

}



// Utils

const { formatCurrency, formatDate, getProductStatus, getProductStatusClass } = useProductsUtils()



// Additional state for compatibility

const selectedProducts = ref([])

const showDeleteConfirmModal = ref(false)

const showAddProductModal = ref(false)

const showEditProductModal = ref(false)

const showProductModal = ref(false)

const isSubmitting = ref(false)

const editProductForm = ref({

  id: null,

  name: '',

  description: '',

  price: 0,

  stock: 0,

  category: '',

  brand: '',

  sku: '',

  status: 'active',

  image: '',

  is_active: 1

})



// Pagination state

const currentPage = ref(1)

const itemsPerPage = ref(10)

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value))

const visiblePages = computed(() => {

  const pages = []

  const start = Math.max(1, currentPage.value - 2)

  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {

    pages.push(i)

  }

  return pages

})

const productCategories = ref([

  { key: 'all', name: 'All', icon: 'apps', count: 0 },

  { key: 'women', name: 'Women', icon: 'woman', count: 0 },

  { key: 'men', name: 'Men', icon: 'man', count: 0 },

  { key: 'kids', name: 'Kids', icon: 'child_care', count: 0 }

])



// Toast state

const showToast = ref(false)

const toastMessage = ref('')

const toastType = ref('success')



// Toast functionality

const showToastMessage = (message, type = 'success') => {

  toastMessage.value = message

  toastType.value = type

  showToast.value = true

  setTimeout(() => {

    showToast.value = false

  }, 3000)

}



// Additional UI state

const showMoreActions = ref(null)

const newProduct = ref({

  name: '',

  slug: '',

  description: '',

  price: 0,

  stock: 0,

  category: '',

  brand: '',

  sku: '',

  status: 'active',

  image: '',

  colors: [] // Initialize colors array

})



// Computed properties for compatibility

const currentProducts = computed(() => filteredProducts.value || [])



// Update category counts

const updateCategoryCounts = () => {

  if (products.value && products.value.length > 0) {

    productCategories.value.forEach(category => {

      if (category.key === 'all') {

        category.count = products.value.length

      } else {

        category.count = products.value.filter(product =>

          product.category?.toLowerCase() === category.key

        ).length

      }

      })

  } else {

    productCategories.value.forEach(category => {

      category.count = 0

    })

  }

}



// Additional functions for compatibility

const applyFilters = () => {

  // Filter logic

}



// Additional functions for UI interactions

const toggleMoreActions = (productId) => {

  showMoreActions.value = showMoreActions.value === productId ? null : productId

}



// Router instance

const router = useRouter()



const viewProduct = (product) => {

  // Navigate to product detail page

  router.push(`/products/${product.id}`)

}



const duplicateProduct = async (product, callback) => {

  try {

    // Create a copy of the product with required fields

    const duplicatedProduct = {

      name: `${product.name} (Copy)`,

      description: product.description || '',

      price: parseFloat(product.price) || 0,

      stock: parseInt(product.stock_quantity || product.stock || 0),

      category: product.category || 'Men',

      brand: product.brand || 'Unknown',

      sku: `${product.sku || 'SKU'}-COPY-${Date.now()}`,

      status: product.is_active === 1 ? 'active' : 'inactive',

      image: product.image_url || product.image || '',

      colors: product.colors || [],

      original_price: parseFloat(product.original_price || product.price || 0),

      source_table: product.source_table

    }



    // Call createProduct API

    await createProduct(duplicatedProduct)

    showToastMessage(`Product "${product.name}" duplicated successfully!`, 'success')

    await loadProducts()



    if (callback) callback()

  } catch (error) {

    console.error('Error duplicating product:', error)

    showToastMessage(`Error duplicating product: ${error.message}`, 'error')

  }

}



// Export functionality is already imported from useProductsActions()



const exportSingleProduct = (product) => {

  try {

    // Create CSV content for single product

    const headers = ['ID', 'Name', 'Price', 'Brand', 'Category', 'Stock', 'Status']

    const row = [

      product.id,

      product.name,

      product.price,

      product.brand,

      product.category,

      product.stock_quantity,

      product.is_active === 1 ? 'Active' : 'Inactive'

    ]



    const csvContent = [

      headers.join(','),

      row.map(cell => `"${cell}"`).join(',')

    ].join('\n')



    // Create and download file

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

    const link = document.createElement('a')

    const url = URL.createObjectURL(blob)



    link.setAttribute('href', url)

    link.setAttribute('download', `product_${product.id}_${product.name.replace(/\s+/g, '_')}.csv`)

    link.style.visibility = 'hidden'



    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)



    showToastMessage(`Product "${product.name}" exported successfully!`, 'success')

  } catch (error) {

    console.error('Error exporting product:', error)

    showToastMessage('Error exporting product', 'error')

  }

}



// Toggle product status

const toggleProductStatus = async (product, callback) => {

  try {

    const newIsActive = product.is_active === 1 ? 0 : 1

    await updateProduct(product.id, { ...product, is_active: newIsActive })

    showToastMessage(`Product ${newIsActive === 1 ? 'activated' : 'deactivated'} successfully`, 'success')

    if (callback) callback()

  } catch (error) {

    console.error('Error toggling product status:', error)

    showToastMessage('Error updating product status', 'error')

  }

}



const clearFilters = () => {

  filters.value = {

    category: '',

    status: '',

    search: ''

  }

}



const toggleSelectAll = () => {

  if (selectedProducts.value?.length === filteredProducts.value?.length) {

    selectedProducts.value = []

    } else {

    selectedProducts.value = filteredProducts.value?.map(p => p.id) || []

  }

}



// Additional functions for compatibility

const editProduct = (product) => {
  selectedProduct.value = { ...product }

  // Fill the edit form with product data
  editProductForm.value = {
    id: product.id,
    name: product.name || '',
    description: product.description || '',
    price: parseFloat(product.price) || 0,
    stock: parseInt(product.stock_quantity || product.stock || 0),
    category: product.category || '',
    brand: product.brand || '',
    sku: product.sku || '',
    status: product.is_active === 1 ? 'active' : 'inactive',
    image: product.image_url || product.image || '',
    is_active: product.is_active || 1,
    source_table: product.source_table
  }

  // Open edit modal
  showEditModal.value = true
  showEditProductModal.value = true

  showMoreActions.value = null

}



// Update product

const handleUpdateProduct = async () => {

  try {

    const updatedData = {

      name: editProductForm.value.name,

      description: editProductForm.value.description,

      price: parseFloat(editProductForm.value.price),

      stock: parseInt(editProductForm.value.stock),

      category: editProductForm.value.category,

      brand: editProductForm.value.brand,

      sku: editProductForm.value.sku,

      status: editProductForm.value.status,

      image: editProductForm.value.image,

      is_active: editProductForm.value.is_active,

      source_table: editProductForm.value.source_table

    }



    await updateProduct(editProductForm.value.id, updatedData)

    showToastMessage(`Product "${editProductForm.value.name}" updated successfully!`, 'success')

    showEditProductModal.value = false

    await loadProducts()

  } catch (error) {

    console.error('Error updating product:', error)

    showToastMessage(`Error updating product: ${error.message}`, 'error')

  }

}



// Perform delete operation

const performDelete = async (product) => {
  // Confirm deletion
  const confirmed = confirm(`⚠️ Are you sure you want to delete "${product.name}"?\n\nThis action cannot be undone!`)

  if (!confirmed) {
    return
  }

  try {
    const result = await deleteProduct(product.id)
    if (result) {
      showToastMessage(`Product "${product.name}" deleted successfully`, 'success')
    await loadProducts()
    }

  } catch (error) {
    console.error('❌ Error deleting product:', error)
    showToastMessage('Error deleting product. Please refresh the page.', 'error')
  }

}



// Simple confirm modal state and opener

const showConfirmModal = ref(false)

const confirmMessage = ref('')

let onConfirm = null

const openConfirm = (message, cb) => { confirmMessage.value = message; onConfirm = cb; showConfirmModal.value = true }



const bulkDelete = (selectedIds, loadProducts, showToastMessage) => {

  if (selectedIds.length === 0) return



  openConfirm('Are you sure you want to delete selected products?', async () => {

    try {

      for (const id of selectedIds) {

        await deleteProduct(id)

      }

      await loadProducts()

      showToastMessage('Products deleted successfully')

    } catch (error) {

      showToastMessage('Error deleting products', 'error')

    }

  })

}



const handleClickOutside = (event) => {

  // Handle click outside logic

}



const handleImageError = (event) => {

  if (event.target) {

    event.target.style.display = 'none'

    if (event.target.nextElementSibling) {

      event.target.nextElementSibling.style.display = 'flex'

    }

  }

}



// Color management functions

const addColor = () => {

  if (!newProduct.value.colors) {

    newProduct.value.colors = []

  }

  newProduct.value.colors.push({

    code: '',

    name: '',

    price: 0,

    quantity: 0,

    image_url: '',

    images: '',

    video_url: '',

    videos: '',

    gallery_images: ''

  })

}



const removeColor = (index) => {

  if (newProduct.value.colors && newProduct.value.colors.length > index) {

    newProduct.value.colors.splice(index, 1)

  }

}



// Reset form function

const resetNewProductForm = () => {

  newProduct.value = {

    name: '',

    slug: '',

    description: '',

    price: 0,

    stock: 0,

    category: '',

    brand: '',

    sku: '',

    status: 'active',

    image: '',

    colors: []

  }

}



// Test Mode Functions

const fillTestProductData = () => {

  newProduct.value = {

    name: 'Nike Air Max 270',

    slug: 'nike-air-max-270',

    description: 'High-performance running shoes with Air Max technology. Features responsive cushioning and breathable mesh upper for maximum comfort during long runs.',

    price: 129.99,

    stock: 25,

    category: 'Running',

    brand: 'Nike',

    sku: 'NK-AM270-001',

    status: 'active',

    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format&q=80',

    colors: []

  }

  showToastMessage('✅ Test product data filled! Ready to add.', 'success')

}



const fillTestColors = () => {

  if (!newProduct.value.colors) {

    newProduct.value.colors = []

  }



  const testColors = [

    {

      code: '#FF0000',

      name: 'Red',

      price: 129.99,

      quantity: 10,

      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format&q=80',

      images: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format&q=80, https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&auto=format&q=80',

      video_url: 'https://example.com/red-shoe-video.mp4',

      videos: 'https://example.com/video1.mp4, https://example.com/video2.mp4',

      gallery_images: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&auto=format&q=80'

    },

    {

      code: '#0000FF',

      name: 'Blue',

      price: 129.99,

      quantity: 8,

      image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&auto=format&q=80',

      images: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&auto=format&q=80, https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&auto=format&q=80',

      video_url: 'https://example.com/blue-shoe-video.mp4',

      videos: 'https://example.com/video3.mp4, https://example.com/video4.mp4',

      gallery_images: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&auto=format&q=80'

    },

    {

      code: '#000000',

      name: 'Black',

      price: 129.99,

      quantity: 15,

      image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&auto=format&q=80',

      images: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&auto=format&q=80, https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format&q=80',

      video_url: 'https://example.com/black-shoe-video.mp4',

      videos: 'https://example.com/video5.mp4, https://example.com/video6.mp4',

      gallery_images: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format&q=80'

    }

  ]



  newProduct.value.colors = testColors

  showToastMessage('🎨 Test colors added! Ready to add.', 'success')

}



const clearAllData = () => {

  resetNewProductForm()

  showToastMessage('All data cleared!', 'info')

}



const copyToClipboard = async (text) => {

  try {

    await navigator.clipboard.writeText(text)

    showToastMessage(`Copied: ${text}`, 'success')

  } catch (err) {

    console.error('Failed to copy: ', err)

    showToastMessage('Failed to copy to clipboard', 'error')

  }

}



// Add Product Function

const addProduct = async (callback, toastCallback) => {

  try {

    isSubmitting.value = true



    // Use the createProduct function from the composable

    await createProduct(newProduct.value)



    // Show success message

    if (toastCallback) {

      toastCallback('Product added successfully!', 'success')

    }



    // Reset form

    resetNewProductForm()



    // Close modal

    showAddProductModal.value = false



    // Reload products

    if (callback) {

      await callback()

    }



  } catch (error) {

    console.error('Error adding product:', error)

    if (toastCallback) {

      toastCallback('Failed to add product: ' + error.message, 'error')

    }

  } finally {

    isSubmitting.value = false

  }

}



// Watch for changes in products to update category counts

watch(products, () => {

  updateCategoryCounts()

}, { deep: true })



// ✅ Enhanced Admin Optimization
const adminOptimization = useAdminOptimization()

// Initialize products on mount

onMounted(async () => {
  // ✅ Start performance monitoring
  const measurement = performanceMonitorEnhanced.startMeasure('admin-products-load', 'page-load')

  try {
  await loadProducts()

  updateCategoryCounts()

    // ✅ Setup lazy loading for images
    requestAnimationFrame(() => {
      const images = document.querySelectorAll('img')
      images.forEach((img, index) => {
        if (index > 10) img.loading = 'lazy'
      })
    })
    
    } finally {
    performanceMonitorEnhanced.endMeasure(measurement)
  }



  // Listen for custom event from sidebar

  const handleOpenAddProductModal = () => {

    showAddProductModal.value = true

  }



  window.addEventListener('openAddProductModal', handleOpenAddProductModal)



  // Cleanup on unmount

  onUnmounted(() => {

    window.removeEventListener('openAddProductModal', handleOpenAddProductModal)

  })

})



</script>



<style scoped>

@import '@/styles/admin/Products.css';

</style>
